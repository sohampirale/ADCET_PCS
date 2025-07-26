-- AlterEnum
ALTER TYPE "Roles" ADD VALUE 'NOT_SET';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "thumbnail" TEXT;
