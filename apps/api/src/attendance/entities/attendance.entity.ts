import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';

export enum AttendanceType {
  IN = 'in',
  OUT = 'out',
}

@Entity('tbl_attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: AttendanceType,
    enumName: 'tbl_attendance_type_enum',
  })
  type: AttendanceType;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
