import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from './env.js';
import { logger } from './logger.js';

export const pool = new pg.Pool({
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

export const ensureDatabaseSchema = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SchoolCategory') THEN
            NULL;
          ELSE
            ALTER TYPE "SchoolCategory" ADD VALUE IF NOT EXISTS 'School_of_Commerce';
            ALTER TYPE "SchoolCategory" ADD VALUE IF NOT EXISTS 'School_of_Management';
          END IF;
        END $$;

        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Album') THEN
            ALTER TABLE "Album" ADD COLUMN IF NOT EXISTS "description" TEXT;
          END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS "_AlbumToEvent" (
            "A" INTEGER NOT NULL,
            "B" INTEGER NOT NULL,
            CONSTRAINT "_AlbumToEvent_AB_pkey" PRIMARY KEY ("A","B")
        );

        CREATE INDEX IF NOT EXISTS "_AlbumToEvent_B_index" ON "_AlbumToEvent"("B");

        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Album') AND
             EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Event') THEN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_AlbumToEvent_A_fkey') THEN
              ALTER TABLE "_AlbumToEvent" ADD CONSTRAINT "_AlbumToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_AlbumToEvent_B_fkey') THEN
              ALTER TABLE "_AlbumToEvent" ADD CONSTRAINT "_AlbumToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
          END IF;
        END $$;
      `);
      logger.info('Database schema verified and synced successfully.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    logger.error(`Database schema verification notice: ${err?.message || err}`);
  }
};
