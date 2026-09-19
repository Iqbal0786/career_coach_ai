/*
  Warnings:

  - You are about to drop the column `lastSummarizedMessageId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "lastSummarizedMessageId",
DROP COLUMN "summary",
ADD COLUMN     "lastMemoryMessageId" TEXT,
ADD COLUMN     "memory" TEXT,
ADD COLUMN     "memoryVersion" INTEGER NOT NULL DEFAULT 1;
