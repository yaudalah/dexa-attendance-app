import { Module, Global } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(
      {
        envFilePath: '../../.env',
        isGlobal: true
      }
    ),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule { }
