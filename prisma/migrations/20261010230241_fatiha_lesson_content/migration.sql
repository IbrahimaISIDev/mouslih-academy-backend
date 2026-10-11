-- AlterTable
ALTER TABLE "lesson_translations" ADD COLUMN     "objective" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "passage" TEXT;

-- CreateTable
CREATE TABLE "lesson_mistakes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "passage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_mistake_translations" (
    "id" TEXT NOT NULL,
    "mistakeId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "mistake" TEXT NOT NULL,
    "correction" TEXT NOT NULL,
    "rule" TEXT NOT NULL,

    CONSTRAINT "lesson_mistake_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_mistakes_lessonId_idx" ON "lesson_mistakes"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_mistake_translations_mistakeId_locale_key" ON "lesson_mistake_translations"("mistakeId", "locale");

-- AddForeignKey
ALTER TABLE "lesson_mistakes" ADD CONSTRAINT "lesson_mistakes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_mistake_translations" ADD CONSTRAINT "lesson_mistake_translations_mistakeId_fkey" FOREIGN KEY ("mistakeId") REFERENCES "lesson_mistakes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
