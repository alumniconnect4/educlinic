-- AlterTable
ALTER TABLE "HelpTicket" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "albumId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
