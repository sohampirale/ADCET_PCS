/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,public_id]` on the table `ImageOwner` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ImageOwner_ownerId_public_id_key" ON "ImageOwner"("ownerId", "public_id");
