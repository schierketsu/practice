-- AlterTable
ALTER TABLE "User" ADD COLUMN "resumeStoredPath" TEXT;
ALTER TABLE "User" ADD COLUMN "resumeOriginalName" TEXT;
ALTER TABLE "User" ADD COLUMN "resumeUploadedAt" DATETIME;
