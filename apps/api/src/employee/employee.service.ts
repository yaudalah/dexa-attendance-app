import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as sharp from 'sharp';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { KafkaService } from '../kafka/kafka.service';
import { EmployeeGateway } from './employee.gateway';
import { RedisService } from '../redis/redis.service';
import { CLOUDINARY } from 'src/common/constant';
import { v2 as Cloudinary } from 'cloudinary';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private kafkaService: KafkaService,
    private employeeGateway: EmployeeGateway,
    private redisService: RedisService,

    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof Cloudinary
  ) {}

  async create(dto: CreateEmployeeDto) {
    this.logger.log(`Creating employee: ${dto.email} (position: ${dto.position})`);

    const existing = await this.employeeRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      this.logger.warn(`Create failed: Email already exists - ${dto.email}`);
      throw new ConflictException('Email already registered');
    }

    this.logger.log(`Hashing password for: ${dto.email}`);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const employee = this.employeeRepo.create({
      ...dto,
      password: hashedPassword,
    });

    const saved = await this.employeeRepo.save(employee);
    this.logger.log(`Employee created successfully: ${saved.id} (${dto.email})`);
    await this.kafkaService.emitEmployeeAudit({
      employeeId: saved.id,
      action: 'create',
      payload: this.toResponse(saved),
      timestamp: new Date(),
    });
    this.logger.log(`Invalidating employee list cache`);
    await this.redisService.invalidateEmployeeCache();
    return this.toResponse(saved);
  }

  async findAll(page = 1, limit = 10) {
    this.logger.log(`Fetching employee list (page: ${page}, limit: ${limit})`);

    const cacheKey = `employees:list:${page}:${limit}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for employees list: ${cacheKey}`);
      return cached;
    }
    this.logger.log(`Cache MISS for employees list: ${cacheKey}, querying DB`);

    const [items, total] = await this.employeeRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      success: true,
      data: items.map((e) => this.toResponse(e)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    await this.redisService.set(cacheKey, result, 3600);
    this.logger.log(`Fetched ${items.length} employees, total: ${total}`);
    return result;
  }

  async findById(id: string) {
    this.logger.log(`Fetching employee by id: ${id}`);

    const cacheKey = `employee:detail:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT for employee detail: ${id}`);
      return cached;
    }
    this.logger.log(`Cache MISS for employee detail: ${id}, querying DB`);

    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      this.logger.warn(`Employee not found: ${id}`);
      throw new NotFoundException('Employee not found');
    }

    const result = {
      success: true,
      data: this.toResponse(employee),
    };
    await this.redisService.set(cacheKey, result, 3600);
    this.logger.log(`Employee fetched: ${employee.email}`);
    return result;
  }

  async findByEmail(email: string) {
    return this.employeeRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdateEmployeeDto, isAdmin: boolean) {
    this.logger.log(`Updating employee: ${id} | payload: ${JSON.stringify({ ...dto, password: dto.password ? '[REDACTED]' : undefined })}`);

    if (!isAdmin && dto.email) {
      throw new ForbiddenException('Forbidden: Staff cannot update email');
    }

    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      this.logger.warn(`Update failed: Employee not found - ${id}`);
      throw new NotFoundException('Employee not found');
    }

    if (dto.email && dto.email !== employee.email) {
      const existing = await this.employeeRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(employee, dto);
    const saved = await this.employeeRepo.save(employee);
    this.logger.log(`Employee updated: ${id} (${saved.email})`);

    this.logger.log(`Emitting audit event to Kafka for employee: ${id}`);
    await this.kafkaService.emitEmployeeAudit({
      employeeId: saved.id,
      action: 'update',
      payload: this.toResponse(saved),
      timestamp: new Date(),
    });
    this.logger.log(`Emitting profile-updated WebSocket event for: ${saved.email}`);
    this.employeeGateway.emitProfileUpdated(saved);
    this.logger.log(`Invalidating Redis cache for employee: ${id}`);
    await this.redisService.invalidateEmployeeCache();
    await this.redisService.invalidateEmployeeDetail(id);

    return {
      success: true,
      data: this.toResponse(saved),
    };
  }

  async remove(id: string) {
    this.logger.log(`Deleting employee: ${id}`);

    const employee = await this.employeeRepo.findOne({ where: { id } });
    if (!employee) {
      this.logger.warn(`Delete failed: Employee not found - ${id}`);
      throw new NotFoundException('Employee not found');
    }
    await this.employeeRepo.remove(employee);
    this.logger.log(`Employee deleted: ${id} (${employee.email})`);
    await this.kafkaService.emitEmployeeAudit({
      employeeId: id,
      action: 'delete',
      payload: this.toResponse(employee),
      timestamp: new Date(),
    });
    await this.redisService.invalidateEmployeeCache();
    await this.redisService.invalidateEmployeeDetail(id);
    return { success: true, message: 'Employee deleted' };
  }

  async uploadPhoto(id: string, file: Express.Multer.File) {
    this.logger.log(`Photo upload for employee: ${id} | size: ${file?.size || 0} bytes`);

    if (!file) {
      this.logger.warn(`Photo upload failed: No file provided`);
      throw new BadRequestException('No file provided');
    }
    if (file.size > MAX_PHOTO_SIZE) {
      this.logger.warn(`Photo upload failed: File too large - ${file.size} bytes`);
      throw new BadRequestException('File size must not exceed 5MB');
    }

    this.logger.log(`Compressing image to WebP for: ${id}`);
    const resizedImageBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toBuffer();

    const webpMimetype = 'image/webp';
    const fileBase64 = resizedImageBuffer.toString("base64");
    const base64 = `data:${webpMimetype};base64,${fileBase64}`;
    const folderName = 'dexa/employees/'
    const fileName = `employee-${id}`;

    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload(
        base64,
        {
          public_id: `${folderName}${fileName}`,
          format: 'webp',
          resource_type: 'image',
        },
        async (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed for ${id}: ${error.message}`);
            reject(new BadRequestException('Upload failed: ' + error.message));
            return;
          }
          this.logger.log(`Cloudinary upload success for ${id}: ${result?.secure_url}`);

          const employee = await this.employeeRepo.findOne({ where: { id } });
          if (!employee) {
            reject(new NotFoundException('Employee not found'));
            return;
          }
          employee.photoUrl = result?.secure_url || '';
          const saved = await this.employeeRepo.save(employee);
          this.logger.log(`Photo URL saved for employee: ${id}`);

          this.logger.log(`Emitting audit event for photo update: ${id}`);
          await this.kafkaService.emitEmployeeAudit({
            employeeId: saved.id,
            action: 'update',
            payload: this.toResponse(saved),
            timestamp: new Date(),
          });

          this.employeeGateway.emitProfileUpdated(saved);
          await this.redisService.invalidateEmployeeCache();
          await this.redisService.invalidateEmployeeDetail(id);

          resolve({
            success: true,
            data: this.toResponse(saved),
          });
        },
      );
    });
  }

  private toResponse(emp: Employee) {
    const { password, ...rest } = emp;
    return rest;
  }
}

