import {
  Controller,
  Get,
  Post,
  Body, Query,
  UseGuards,
  Req
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceType } from './entities/attendance.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  checkInOut(
    @Req() req: { user: { id: string } },
    @Body('type') type: AttendanceType,
  ) {
    return this.attendanceService.checkInOut(req.user.id, type);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(
    @Req() req: { user: { id: string } },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.getHistory(
      req.user.id,
      startDate,
      endDate,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('monitoring')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getMonitoring(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.getMonitoringStream(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
