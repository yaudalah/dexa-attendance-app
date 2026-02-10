import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeAuditTrail } from './entities/employee-audit-trail.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeAuditTrail])],
  providers: [AuditService],
})
export class AuditModule {}
