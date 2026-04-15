import { LRUCache } from 'lru-cache/raw';
import { redisClient } from './redis.js';
import type { createClient } from 'redis';
import { logger } from './logger.js';
import z from 'zod';

const cacheConfigSchema = z.object({
  size: z.number().positive().max(10_000).default(100),
  lruTTL: z
    .number()
    .positive()
    .min(1_000)
    .max(15 * 60 * 1000),
  redisTTL: z
    .number()
    .positive()
    .min(60 * 1000)
    .max(24 * 60 * 60 * 1000),
});

class cacheManager<T extends {}> {
  private lru: LRUCache<string, any>;
  private redis: ReturnType<typeof createClient>;

  private lruTTL: number;
  private redisTTL: number;

  constructor({ size, lruTTL, redisTTL }: { size: number; lruTTL: number; redisTTL: number }) {
    const parsed = cacheConfigSchema.parse({ size, lruTTL, redisTTL });
    this.lruTTL = parsed.lruTTL;
    this.redisTTL = parsed.redisTTL;

    this.lru = new LRUCache<string, T>({
      max: parsed.size,
      ttl: this.lruTTL,
    });

    this.redis = redisClient as ReturnType<typeof createClient>;
  }

  async set(key: string, value: T): Promise<void> {
    try {
      this.lru.set(key, value);
      const parsed = JSON.stringify(value);
      await this.redis.set(key, parsed, {
        EX: this.redisTTL,
      });
    } catch (error) {
      logger.error('Failed to set cache!');
    }
  }

  async get(key: string): Promise<T | null> {
    try {
      const value = this.lru.get(key);
      if (value !== undefined) {
        return value;
      }
      const redisValue = await this.redis.get(key);
      if (redisValue !== null) {
        const parsed = JSON.parse(redisValue);
        this.lru.set(key, parsed);
        return parsed;
      }
    } catch (error) {
      logger.error('Failed to get cache!');
    }
    return null;
  }

  async update(key: string, value: T): Promise<void> {
    try {
      this.set(key, value);
    } catch (error) {
      logger.error('Failed to update cache!');
    }
  }

  async del_lru(key: string): Promise<void> {
    try {
      this.lru.delete(key);
    } catch (error) {
      logger.error('Failed to delete cache from LRU!');
    }
  }

  async del_redis(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Failed to delete cache from Redis!');
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.del_lru(key);
      await this.del_redis(key);
    } catch (error) {
      logger.error('Failed to delete cache!');
    }
  }
}

export const cache = new cacheManager({
    size: 11, 
    lruTTL: 5 * 60 * 1000, // 5 minutes
    redisTTL: 60 * 60 * 1000, // 1 hour
})
