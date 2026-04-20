-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ALUMINI', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SchoolCategory" AS ENUM ('School_of_Engineering', 'School_of_law', 'School_of_agriculture', 'School_of_Medicine');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "schoolCategory" "SchoolCategory",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
