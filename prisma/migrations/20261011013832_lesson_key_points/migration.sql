-- AlterTable
ALTER TABLE "lesson_translations" ADD COLUMN     "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[];
