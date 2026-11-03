-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDeveloper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "developerTitle" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_isDeveloper_idx" ON "User"("isDeveloper");
