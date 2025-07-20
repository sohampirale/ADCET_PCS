-- CreateEnum
CREATE TYPE "Genders" AS ENUM ('Male', 'Female');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Genders";
