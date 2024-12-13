/*
  Warnings:

  - Added the required column `loserScore` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerScore` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "loserScore" INTEGER NOT NULL,
ADD COLUMN     "winnerScore" INTEGER NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "maxRankDifference" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
