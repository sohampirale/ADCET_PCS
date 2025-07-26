/*
  Warnings:

  - Added the required column `credit` to the `EventCoordinator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventCoordinator" ADD COLUMN     "credit" TEXT NOT NULL;
