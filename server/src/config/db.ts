import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { logger } from './logger.js';
import { env } from './env.js';

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.success('Database connected successfully');
  } catch (error) {
    logger.error('Error connecting to database', error);
    process.exit(1);
  }
};

export const db = {
  connect: connectDB,
  client: prisma,
};
