/*
  Warnings:

  - Made the column `customPermissions` on table `TeamMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "customPermissions" SET NOT NULL,
ALTER COLUMN "customPermissions" SET DATA TYPE TEXT;
