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

export interface SessionData {
  id: number;
  role: string;
}

export const generateSessionKey = (sessionId: string) => `session:${sessionId}`;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const storeSession = async (
  sessionId: string,
  data: SessionData
): Promise<void> => {
  const key = generateSessionKey(sessionId);
  try {
    await redis.set(key, JSON.stringify(data), { EX: SESSION_TTL_SECONDS });
  } catch (error) {
    logger.error('Failed to store session in Redis!');
  }
};

export const getSession = async (
  sessionId: string
): Promise<SessionData | null> => {
  const key = generateSessionKey(sessionId);
  try {
    const redisValue = await redis.get(key);
    if (redisValue) {
      return JSON.parse(redisValue) as SessionData;
    }
  } catch (error) {
    logger.error('Failed to get session from Redis!');
  }
  return null;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const key = generateSessionKey(sessionId);
  try {
    await redis.del(key);
  } catch (error) {
    logger.error('Failed to delete session from Redis!');
  }
};

// --- Generic Cache Helpers ---
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (error) {
    logger.error(`Redis getCache failed for key "${key}"`);
  }
  return null;
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttlSeconds: number = REDIS_TTL_SECONDS
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    logger.error(`Redis setCache failed for key "${key}"`);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    logger.error(`Redis deleteCachePattern failed for pattern "${pattern}"`);
  }
};

// --- Event Cache Helpers ---
export const generateEventListCacheKey = (
  limit: number | string,
  offset: number | string,
  filter?: string,
  search?: string
) => `events:list:${limit}:${offset}:${filter || 'all'}:${search || ''}`;

export const generateEventDetailCacheKey = (id: number | string) =>
  `events:detail:${id}`;

export const invalidateEventsCache = async (): Promise<void> => {
  await deleteCachePattern('events:*');
};

// --- Gallery Cache Helpers ---
export const generateGalleryListCacheKey = (
  limit: number | string,
  offset: number | string,
  search?: string
) => `gallery:albums:list:${limit}:${offset}:${search || ''}`;

export const generateGalleryDetailCacheKey = (id: number | string) =>
  `gallery:album:detail:${id}`;

export const invalidateGalleryCache = async (): Promise<void> => {
  await deleteCachePattern('gallery:*');
};

