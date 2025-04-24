-- AlterTable
ALTER TABLE "ContentResource" ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "visibility" TEXT;
