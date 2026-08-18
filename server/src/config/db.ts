import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from './env.js';
import { logger } from './logger.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error(`Unexpected PostgreSQL Pool Error: ${err?.message || err}`);
});

const adapter: PrismaPg = new PrismaPg(pool, {
  onPoolError: (err) => {
    logger.error(`Prisma PostgreSQL Pool Error: ${err?.message || err}`);
  },
  onConnectionError: (err) => {
    logger.error(`Prisma PostgreSQL Connection Error: ${err?.message || err}`);
  },
});

export const prisma: PrismaClient = new PrismaClient({ adapter });
