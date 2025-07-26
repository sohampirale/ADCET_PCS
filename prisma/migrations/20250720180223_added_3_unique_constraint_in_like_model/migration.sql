/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,ePortfolioId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,handmadePortfolioId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,eventId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_ownerId_ePortfolioId_key" ON "Like"("ownerId", "ePortfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_ownerId_handmadePortfolioId_key" ON "Like"("ownerId", "handmadePortfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_ownerId_eventId_key" ON "Like"("ownerId", "eventId");
