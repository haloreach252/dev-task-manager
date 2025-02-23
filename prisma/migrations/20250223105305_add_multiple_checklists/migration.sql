/*
  Warnings:

  - You are about to drop the column `taskId` on the `ChecklistItem` table. All the data in the column will be lost.
  - Added the required column `checklistId` to the `ChecklistItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChecklistItem" DROP CONSTRAINT "ChecklistItem_taskId_fkey";

-- DropIndex
DROP INDEX "ChecklistItem_taskId_idx";

-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "taskId",
ADD COLUMN     "checklistId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Checklist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistItem_checklistId_idx" ON "ChecklistItem"("checklistId");

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
