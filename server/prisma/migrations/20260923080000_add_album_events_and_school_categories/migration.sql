-- AlterEnum
ALTER TYPE "SchoolCategory" ADD VALUE IF NOT EXISTS 'School_of_Commerce';
ALTER TYPE "SchoolCategory" ADD VALUE IF NOT EXISTS 'School_of_Management';

-- AlterTable
ALTER TABLE "Album" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "_AlbumToEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlbumToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_AlbumToEvent_B_index" ON "_AlbumToEvent"("B");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_AlbumToEvent_A_fkey'
  ) THEN
    ALTER TABLE "_AlbumToEvent" ADD CONSTRAINT "_AlbumToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_AlbumToEvent_B_fkey'
  ) THEN
    ALTER TABLE "_AlbumToEvent" ADD CONSTRAINT "_AlbumToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
