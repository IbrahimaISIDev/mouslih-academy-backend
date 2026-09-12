-- Champs decouverts en construisant EnrollmentsModule : date de completion d'une formation,
-- et enseignant ayant repondu a une question de lecon (pour afficher l'auteur de la reponse,
-- distinct de l'auteur de la question, cote frontend).
ALTER TABLE "enrollments" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "lesson_questions" ADD COLUMN "answeredById" TEXT;

ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_answeredById_fkey"
    FOREIGN KEY ("answeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
