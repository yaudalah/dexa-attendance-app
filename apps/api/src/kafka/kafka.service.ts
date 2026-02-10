import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
const KAFKA_TOPIC_EMPLOYEE_AUDIT = 'employee.audit';

export interface EmployeeAuditPayload {
  employeeId: string;
  action: string;
  payload: unknown;
  timestamp: Date;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'dexa-api',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emitEmployeeAudit(data: EmployeeAuditPayload) {
    await this.producer.send({
      topic: process.env.KAFKA_TOPIC_EMPLOYEE_AUDIT || KAFKA_TOPIC_EMPLOYEE_AUDIT,
      messages: [
        {
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
