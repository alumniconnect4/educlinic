import z from 'zod';
import dotenv from 'dotenv';
import { logger } from './logger.js';
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['DEVELOPMENT', 'PRODUCTION', 'TEST'])
    .default('DEVELOPMENT'),

  HOST: z.string('HOST is required').default('0.0.0.0'),
  PORT: z
    .string('PORT is required')
    .default('5000')
    .transform((val) => Number(val)),

  DATABASE_URL: z.string('DATABASE_URL is required').nonempty(),

  CLOUDINARY_CLOUD_NAME: z
    .string('CLOUDINARY_CLOUD_NAME is required')
    .nonempty(),
  CLOUDINARY_API_KEY: z.string('CLOUDINARY_API_KEY is required').nonempty(),
  CLOUDINARY_API_SECRET: z
    .string('CLOUDINARY_API_SECRET is required')
    .nonempty(),

  JWT_ACCESS_SECRET: z.string('JWT_ACCESS_SECRET is required').min(10),

  JWT_TOKEN_EXPIRY: z.coerce.number().default(86400),

  REDIS_HOST: z.string('REDIS_HOST is required').default('localhost'),
  REDIS_PORT: z
    .string('REDIS_PORT is required')
    .default('6379')
    .transform((val) => Number(val)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(
    'Environment variable validation failed:',
    z.formatError(parsed.error)
  );
  throw new Error('invalid or missing environment variables');
}

export const env = parsed.data;
