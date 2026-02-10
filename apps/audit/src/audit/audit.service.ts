import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kafka } from 'kafkajs';
import { EmployeeAuditTrail } from './entities/employee-audit-trail.entity';

const TOPIC = process.env.KAFKA_TOPIC_EMPLOYEE_AUDIT || 'employee.audit';

@Injectable()
export class AuditService implements OnModuleInit {
  constructor(
    @InjectRepository(EmployeeAuditTrail)
    private auditRepo: Repository<EmployeeAuditTrail>,
  ) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'dexa-audit',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    const consumer = kafka.consumer({ groupId: 'dexa-audit-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;
          const data = JSON.parse(value);
          const record = this.auditRepo.create({
            employeeId: data.employeeId,
            action: data.action,
            payload: data.payload,
            timestamp: new Date(data.timestamp),
          });
          await this.auditRepo.save(record);
          console.log('Audit record saved:', record.id);
        } catch (err) {
          console.error('Audit consume error:', err);
        }
      },
    });
  }
}
