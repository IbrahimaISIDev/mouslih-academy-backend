import type { I18nText } from '../../catalog/mappers/i18n.js';
import { initialsOf } from './initials.js';
import { relativeTimeLabel } from './relative-time.js';

/**
 * Une question/réponse réelle est écrite dans une seule langue par son auteur (contrairement au
 * jeu de démo, où le même texte avait été traduit à la main dans les 3 langues) : on ne fabrique
 * pas de fausses traductions, le texte brut est simplement répété sur les 3 clés — I18nText
 * retombe de toute façon sur 'fr' pour la locale manquante côté frontend.
 */
function toI18nText(raw: string): I18nText {
  return { fr: raw, en: raw, ar: raw };
}

interface UserRow {
  firstName: string;
  lastName: string;
}

export interface LessonQuestionRow {
  id: string;
  lessonId: string;
  question: string;
  answer: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  user: UserRow;
  answeredBy: UserRow | null;
}

export function mapLessonQuestion(row: LessonQuestionRow) {
  return {
    id: row.id,
    lessonId: row.lessonId,
    authorName: `${row.user.firstName} ${row.user.lastName}`,
    authorInitials: initialsOf(row.user.firstName, row.user.lastName),
    timeAgoLabel: relativeTimeLabel(row.createdAt),
    body: toI18nText(row.question),
    answer:
      row.answer && row.answeredBy && row.answeredAt
        ? {
            authorName: `${row.answeredBy.firstName} ${row.answeredBy.lastName}`,
            authorInitials: initialsOf(row.answeredBy.firstName, row.answeredBy.lastName),
            timeAgoLabel: relativeTimeLabel(row.answeredAt),
            body: toI18nText(row.answer),
          }
        : undefined,
  };
}
