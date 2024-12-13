/*
  Warnings:

  - A unique constraint covering the columns `[activeForUserId]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "activeForUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_activeForUserId_key" ON "Challenge"("activeForUserId");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_activeForUserId_fkey" FOREIGN KEY ("activeForUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
