import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { Attendance } from './entities/attendance.entity';
import { AttendanceType } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) { }

  async checkInOut(employeeId: string, type: AttendanceType) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const todayRecords = await this.attendanceRepo.find({
      where: {
        employeeId,
        timestamp: Between(todayStart, todayEnd),
      },
    });

    const hasCheckIn = todayRecords.some(r => r.type === AttendanceType.IN);
    const hasCheckOut = todayRecords.some(r => r.type === AttendanceType.OUT);

    if (type === AttendanceType.IN) {
      if (hasCheckIn) {
        throw new BadRequestException('Already checked in today');
      }
    }

    if (type === AttendanceType.OUT) {
      if (!hasCheckIn) {
        throw new BadRequestException('Check in first before checkout');
      }
      if (hasCheckOut) {
        throw new BadRequestException('Already checked out today');
      }
    }

    const attendance = this.attendanceRepo.create({ employeeId, type });

    const saved = await this.attendanceRepo.save(attendance);

    return {
      success: true,
      data: {
        id: saved.id,
        type: saved.type,
        timestamp: saved.timestamp,
      },
    };
  }
  
  async getHistory(
    employeeId: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 20,
  ) {
    let query = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.employee_id = :employeeId', { employeeId })
      .orderBy('a.timestamp', 'DESC');

    if (startDate && isValid(parseISO(startDate))) {
      query = query.andWhere('a.timestamp >= :startDate', {
        startDate: startOfDay(parseISO(startDate)),
      });
    }
    if (endDate && isValid(parseISO(endDate))) {
      query = query.andWhere('a.timestamp <= :endDate', {
        endDate: endOfDay(parseISO(endDate)),
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMonitoringStream(page = 1, limit = 50) {
    const [items, total] = await this.attendanceRepo.findAndCount({
      relations: ['employee'],
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: items.map((a) => ({
        id: a.id,
        employeeId: a.employeeId,
        employeeName: a.employee?.name,
        type: a.type,
        timestamp: a.timestamp,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
