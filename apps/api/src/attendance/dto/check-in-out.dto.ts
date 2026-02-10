import { IsEnum, IsNotEmpty } from 'class-validator';
import { AttendanceType } from '../entities/attendance.entity';

export class CheckInOutDto {
  @IsEnum(AttendanceType)
  @IsNotEmpty()
  type: AttendanceType;
}
