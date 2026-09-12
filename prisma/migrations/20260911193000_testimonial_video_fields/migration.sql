-- Testimonial : champs manquants du contrat frontend (src/lib/types.ts) découverts en
-- construisant CatalogModule.
ALTER TABLE "testimonials" ADD COLUMN "videoDuration" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "highlighted" BOOLEAN NOT NULL DEFAULT false;
