/*
  Warnings:

  - A unique constraint covering the columns `[eventId,coordinatorId,credit]` on the table `EventCoordinator` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EventCoordinator_eventId_coordinatorId_key";

-- CreateIndex
CREATE UNIQUE INDEX "EventCoordinator_eventId_coordinatorId_credit_key" ON "EventCoordinator"("eventId", "coordinatorId", "credit");
