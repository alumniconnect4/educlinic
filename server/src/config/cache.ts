import { LRUCache } from 'lru-cache/raw';
import { redisClient } from './redis.js';
import type { createClient } from 'redis';
import { logger } from './logger.js';
import type { User } from '../../generated/prisma/browser.js';

const lru = new LRUCache<string, any>({
  max: 100,
  ttl: 5 * 60 * 1000,
});

const redis = redisClient as ReturnType<typeof createClient>;
const REDIS_TTL_SECONDS = 60 * 60;

//function to generate a key to store user in cache
export const generateUserCacheKey = (email: string) => `user:${email}`;

//function to cache user
export const cacheUser = async (user: User): Promise<void> => {
  const key = generateUserCacheKey(user.email);
  try {
    lru.set(key, user);
    await redis.set(key, JSON.stringify(user), { EX: REDIS_TTL_SECONDS });
  } catch (error) {
    logger.error('Failed to cache user!');
  }
};

//function to get user from cache
export const getUserFromCache = async (email: string): Promise<User | null> => {
  const key = generateUserCacheKey(email);
  try {
    const value = lru.get(key) as User | undefined;
    if (value !== undefined) {
      return value;
    }
    const redisValue = await redis.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue) as User;
      lru.set(key, parsed);
      return parsed;
    }
  } catch (error) {
    logger.error('Failed to get user from cache!');
  }
  return null;
};

//function to update user in cache
export const updateCachedUser = async (user: User): Promise<void> => {
  await cacheUser(user);
};

//function to delete user from cache
export const deleteUserCache = async (email: string): Promise<void> => {
  const key = generateUserCacheKey(email);
  try {
    lru.delete(key);
    await redis.del(key);
  } catch (error) {
    logger.error('Failed to delete user cache!');
  }
};
