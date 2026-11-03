-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "registrationLimit" INTEGER,
ADD COLUMN     "startRegistrationsNow" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "visibility" SET DEFAULT 'GLOBAL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "degreeUrl" TEXT,
ADD COLUMN     "idCardUrl" TEXT;
