/*
  Warnings:

  - Added the required column `mediaType` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postUrl` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "mediaType" TEXT NOT NULL,
ADD COLUMN     "postUrl" TEXT NOT NULL;
