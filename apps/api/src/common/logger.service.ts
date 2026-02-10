import { LoggerService as NestLoggerService } from '@nestjs/common';

export class AppLogger implements NestLoggerService {
  constructor(private readonly context: string) {}

  log(message: string, ...optionalParams: unknown[]) {
    console.log(`[${new Date().toISOString()}] [${this.context}] ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]) {
    console.error(`[${new Date().toISOString()}] [${this.context}] ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]) {
    console.warn(`[${new Date().toISOString()}] [${this.context}] ${message}`, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [${this.context}] ${message}`, ...optionalParams);
    }
  }
}
