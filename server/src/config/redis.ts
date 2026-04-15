import { createClient } from 'redis';
import { env } from './env.js';
import { logger } from './logger.js';

const redisClient: ReturnType<typeof createClient> = createClient({
  url: env.REDIS_HOST + ':' + env.REDIS_PORT,
});

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis successfully');
  } catch (error) {
    logger.error(`Error connecting to Redis: ${error}`);
  }
};

export { redisClient, connectRedis };
