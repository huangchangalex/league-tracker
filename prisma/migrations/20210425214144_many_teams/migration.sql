/*
  Warnings:

  - The `teamId` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `winRate` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER[];

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "winRate";

-- CreateTable
CREATE TABLE "_PlayerToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToTeam_AB_unique" ON "_PlayerToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToTeam_B_index" ON "_PlayerToTeam"("B");

-- AddForeignKey
ALTER TABLE "_PlayerToTeam" ADD FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToTeam" ADD FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
