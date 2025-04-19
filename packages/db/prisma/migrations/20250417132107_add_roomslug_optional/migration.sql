/*
  Warnings:

  - You are about to drop the column `roomId` on the `Chat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "roomId",
ADD COLUMN     "roomSlug" TEXT;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomSlug_fkey" FOREIGN KEY ("roomSlug") REFERENCES "Room"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
