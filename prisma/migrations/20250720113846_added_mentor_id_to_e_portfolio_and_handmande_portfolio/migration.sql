-- AlterTable
ALTER TABLE "EPortfolio" ADD COLUMN     "mentorId" TEXT;

-- AlterTable
ALTER TABLE "HandmadePortfolio" ADD COLUMN     "mentorId" TEXT;

-- AddForeignKey
ALTER TABLE "EPortfolio" ADD CONSTRAINT "EPortfolio_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandmadePortfolio" ADD CONSTRAINT "HandmadePortfolio_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
