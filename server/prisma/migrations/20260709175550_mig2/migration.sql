-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('OFFLINE', 'ONLINE');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('GLOBAL', 'DEPARTMENTAL');

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizedBy" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "visibility" "EventVisibility" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
