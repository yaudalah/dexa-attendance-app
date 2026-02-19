import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DEFAULT_LIMIT, DEFAULT_MAX_LIMIT, DEFAULT_PAGE } from 'src/common/constant';

@Controller('employees')
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);
  private readonly maxEmployeeListLimit: number;

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly configService: ConfigService,
  ) {
    const configuredMaxLimit = Number.parseInt(
      this.configService.get<string>('EMPLOYEE_LIST_MAX_LIMIT') ?? `${DEFAULT_MAX_LIMIT}`,
      10,
    );
    this.maxEmployeeListLimit =
      Number.isInteger(configuredMaxLimit) && configuredMaxLimit > 0
        ? configuredMaxLimit
        : DEFAULT_MAX_LIMIT;
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number.parseInt(page ?? `${DEFAULT_PAGE}`, 10);
    const parsedLimit = Number.parseInt(limit ?? `${DEFAULT_LIMIT}`, 10);

    const safePage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
    const safeLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, this.maxEmployeeListLimit)
        : DEFAULT_LIMIT;

    this.logger.log(
      `Fetching employees - Page: ${safePage}, Limit: ${safeLimit}, MaxLimit: ${this.maxEmployeeListLimit}`,
    );

    return this.employeeService.findAll(safePage, safeLimit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: { user: { id: string } }) {
    return this.employeeService.findById(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: { user: { id: string; position: string } },
  ) {
    const isAdmin = req.user.position === 'admin';
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('Forbidden');
    }
    return this.employeeService.update(id, dto, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Post(':id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { id: string; position: string } },
  ) {
    const isAdmin = req.user.position === 'admin';
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('Forbidden');
    }
    return this.employeeService.uploadPhoto(id, file);
  }
}
