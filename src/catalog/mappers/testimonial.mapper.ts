import { buildI18nText } from './i18n.js';
import { testimonialKindToFrontend } from './enums.js';
import type { TestimonialKind } from '../../generated/prisma/enums.js';

interface TranslationRow {
  locale: string;
  quote: string;
}

export interface TestimonialRow {
  id: string;
  authorName: string;
  authorCity: string;
  courseId: string;
  kind: TestimonialKind;
  videoUrl: string | null;
  videoDuration: string | null;
  highlighted: boolean;
  translations: TranslationRow[];
}

export function mapTestimonial(testimonial: TestimonialRow) {
  return {
    id: testimonial.id,
    authorName: testimonial.authorName,
    authorCity: testimonial.authorCity,
    courseId: testimonial.courseId,
    quote: buildI18nText(testimonial.translations, 'quote'),
    kind: testimonialKindToFrontend(testimonial.kind),
    videoUrl: testimonial.videoUrl ?? undefined,
    videoDuration: testimonial.videoDuration ?? undefined,
    highlighted: testimonial.highlighted || undefined,
  };
}
