export type Locale = 'fr' | 'en' | 'ar';
export type I18nText = Record<Locale, string>;

const LOCALES: Locale[] = ['fr', 'en', 'ar'];

interface LocalizedRow {
  locale: string;
}

/**
 * Reconstruit un champ I18nText à partir de lignes de traduction Prisma (une ligne par locale).
 * La locale manquante retombe sur 'fr', conformément à la doc du type I18nText côté frontend.
 */
export function buildI18nText<T extends LocalizedRow>(rows: T[], field: keyof T): I18nText {
  const byLocale = new Map(rows.map((row) => [row.locale.toLowerCase(), row]));
  const fr = byLocale.get('fr');
  const fallback = fr ? String(fr[field] ?? '') : '';

  return LOCALES.reduce((acc, locale) => {
    const row = byLocale.get(locale);
    acc[locale] = row ? String(row[field] ?? '') || fallback : fallback;
    return acc;
  }, {} as I18nText);
}

/** Variante pour un champ optionnel (heroTagline...) : renvoie undefined si aucune locale ne l'a. */
export function buildOptionalI18nText<T extends LocalizedRow>(rows: T[], field: keyof T): I18nText | undefined {
  const hasAny = rows.some((row) => row[field] != null && String(row[field]).length > 0);
  return hasAny ? buildI18nText(rows, field) : undefined;
}

/**
 * "complete" si toutes les locales ont ce champ, "empty" si aucune, "partial" sinon.
 * Reflète Course.translationStatus côté frontend.
 */
export function computeTranslationStatus<T extends LocalizedRow>(
  rows: T[],
  fields: (keyof T)[],
): Record<Locale, 'complete' | 'partial' | 'empty'> {
  const byLocale = new Map(rows.map((row) => [row.locale.toLowerCase(), row]));

  return LOCALES.reduce(
    (acc, locale) => {
      const row = byLocale.get(locale);
      if (!row) {
        acc[locale] = 'empty';
        return acc;
      }
      const filled = fields.filter((field) => row[field] != null && String(row[field]).length > 0).length;
      acc[locale] = filled === 0 ? 'empty' : filled === fields.length ? 'complete' : 'partial';
      return acc;
    },
    {} as Record<Locale, 'complete' | 'partial' | 'empty'>,
  );
}
