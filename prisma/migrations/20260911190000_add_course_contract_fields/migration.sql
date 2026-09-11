-- Aligne le schéma sur le contrat réel du frontend (src/lib/types.ts), plus riche que la
-- première passe : Course.subtitle/cardDescription/heroTagline(Mobile)/lessonCount/
-- compareAtPrice, Lesson.slug, Resource traduit avec sizeKb.

-- Course : renomme promoPrice -> compareAtPrice, supprime la fenêtre temporelle (non utilisée
-- par le frontend), ajoute lessonCount dénormalisé.
ALTER TABLE "courses" RENAME COLUMN "promoPrice" TO "compareAtPrice";
ALTER TABLE "courses" DROP COLUMN "promoStartAt";
ALTER TABLE "courses" DROP COLUMN "promoEndAt";
ALTER TABLE "courses" ADD COLUMN "lessonCount" INTEGER NOT NULL DEFAULT 0;

-- CourseTranslation : shortDescription -> cardDescription, + subtitle (obligatoires),
-- + heroTagline/heroTaglineMobile (optionnels).
ALTER TABLE "course_translations" RENAME COLUMN "shortDescription" TO "cardDescription";
ALTER TABLE "course_translations" ADD COLUMN "subtitle" TEXT NOT NULL DEFAULT '';
ALTER TABLE "course_translations" ALTER COLUMN "subtitle" DROP DEFAULT;
ALTER TABLE "course_translations" ADD COLUMN "heroTagline" TEXT;
ALTER TABLE "course_translations" ADD COLUMN "heroTaglineMobile" TEXT;

-- Lesson : slug utilisé dans les URLs /formations/[slug]/lecons/[lessonSlug].
ALTER TABLE "lessons" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "lessons" ALTER COLUMN "slug" DROP DEFAULT;
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- Resource : fileUrl -> url, ajoute sizeKb, déplace le libellé/la description vers des
-- traductions par locale (title/description).
ALTER TABLE "resources" RENAME COLUMN "fileUrl" TO "url";
ALTER TABLE "resources" DROP COLUMN "label";
ALTER TABLE "resources" ADD COLUMN "sizeKb" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "resources" ALTER COLUMN "sizeKb" DROP DEFAULT;

CREATE TABLE "resource_translations" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "resource_translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "resource_translations_resourceId_locale_key" ON "resource_translations"("resourceId", "locale");

ALTER TABLE "resource_translations" ADD CONSTRAINT "resource_translations_resourceId_fkey"
    FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
