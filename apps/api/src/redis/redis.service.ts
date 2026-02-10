import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '3600', 10);

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: unknown, ttl = CACHE_TTL): Promise<void> {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async invalidateEmployeeCache(): Promise<void> {
    const keys = await this.client.keys('employees:list:*');
    if (keys.length) await this.client.del(keys);
  }

  async invalidateEmployeeDetail(id: string): Promise<void> {
    await this.client.del(`employee:detail:${id}`);
  }
}
