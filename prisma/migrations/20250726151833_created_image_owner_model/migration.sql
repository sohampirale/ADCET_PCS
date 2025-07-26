-- CreateTable
CREATE TABLE "ImageOwner" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ImageOwner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageOwner" ADD CONSTRAINT "ImageOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
