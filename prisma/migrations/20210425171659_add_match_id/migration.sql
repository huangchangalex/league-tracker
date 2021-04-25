/*
  Warnings:

  - A unique constraint covering the columns `[matchId]` on the table `Matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchId` to the `Matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Matches" ADD COLUMN     "matchId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Matches.matchId_unique" ON "Matches"("matchId");
