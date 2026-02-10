import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeGateway } from './employee.gateway';
import { KafkaModule } from '../kafka/kafka.module';
import { RedisModule } from '../redis/redis.module';
import { CloudinaryProvider } from 'src/common/cloudinary.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      envFilePath: '../../.env',
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([Employee]),
    KafkaModule,
    RedisModule,
  ],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeGateway,
    CloudinaryProvider,
  ],
  exports: [EmployeeService],
})
export class EmployeeModule {}
