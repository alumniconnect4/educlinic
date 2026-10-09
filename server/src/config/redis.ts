import { createClient } from 'redis';
import { env } from './env.js';
import { logger } from './logger.js';

const redisClient: ReturnType<typeof createClient> = createClient({
  url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
  socket: {
    reconnectStrategy: (retries: number) => {
      const delay = Math.min(retries * 100, 3000);
      logger.warn(
        `Redis client reconnecting in ${delay}ms (attempt ${retries})...`
      );
      return delay;
    },
    connectTimeout: 5000,
  },
});

redisClient.on('error', (err: any) => {
  logger.error(`Redis Client Error: ${err?.message || err}`);
});

redisClient.on('connect', () => {
  logger.info('Redis Client socket connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client ready and operational');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis Client reconnecting...');
});

const connectRedis = async (
  maxRetries = 5,
  retryDelayMs = 2000
): Promise<void> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      logger.info('Connected to Redis successfully');
      return;
    } catch (error) {
      logger.error(
        `Redis connection attempt ${attempt}/${maxRetries} failed: ${error}`
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
  logger.warn(
    'Redis initial connection could not be established; background reconnection will continue.'
  );
};

export { redisClient, connectRedis };
