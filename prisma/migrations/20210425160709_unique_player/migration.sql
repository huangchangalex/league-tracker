/*
  Warnings:

  - You are about to drop the column `playerId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `_PlayerToTeam` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[puuid]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_PlayerToTeam" DROP CONSTRAINT "_PlayerToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlayerToTeam" DROP CONSTRAINT "_PlayerToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "playerId";

-- DropTable
DROP TABLE "_PlayerToTeam";

-- CreateIndex
CREATE UNIQUE INDEX "Player.name_unique" ON "Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Player.puuid_unique" ON "Player"("puuid");

-- AddForeignKey
ALTER TABLE "Player" ADD FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
