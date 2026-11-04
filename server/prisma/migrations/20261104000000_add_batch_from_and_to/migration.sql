-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "batchFrom" VARCHAR(30);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "batchTo" VARCHAR(30);

-- Ensure missing or empty batch fields are set to NULL
UPDATE "User" SET "batchFrom" = NULL WHERE "batchFrom" IS NOT NULL AND TRIM("batchFrom") = '';
UPDATE "User" SET "batchTo" = NULL WHERE "batchTo" IS NOT NULL AND TRIM("batchTo") = '';


