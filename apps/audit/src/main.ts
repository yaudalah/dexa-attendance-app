import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
  console.log('Dexa Audit Service (Kafka Consumer) running');
}

bootstrap();
