import type { I18nText } from '../../catalog/mappers/i18n.js';

const RTF: Record<'fr' | 'en' | 'ar', Intl.RelativeTimeFormat> = {
  fr: new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }),
  en: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
  ar: new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }),
};

/** "il y a 3 jours" / "3 days ago" / "..." à partir d'une date, dans les 3 langues. */
export function relativeTimeLabel(date: Date): I18nText {
  const diffMs = date.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  const [value, unit]: [number, Intl.RelativeTimeFormatUnit] =
    Math.abs(diffDays) >= 1 ? [diffDays, 'day'] : [diffHours, 'hour'];

  return {
    fr: RTF.fr.format(value, unit),
    en: RTF.en.format(value, unit),
    ar: RTF.ar.format(value, unit),
  };
}
