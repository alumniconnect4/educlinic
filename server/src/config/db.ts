import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from './env.js';

const connectionString: string = `${env.DATABASE_URL}`;

const adapter: PrismaPg = new PrismaPg({ connectionString });
export const prisma: PrismaClient = new PrismaClient({ adapter });
