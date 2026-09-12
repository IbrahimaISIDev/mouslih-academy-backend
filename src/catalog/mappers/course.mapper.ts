import { buildI18nText, buildOptionalI18nText, computeTranslationStatus } from './i18n.js';
import { courseStatusToFrontend, levelToFrontend } from './enums.js';
import { publicVideoUrl } from './video-url.js';
import type { ContentStatus, CourseLevel, VideoProvider } from '../../generated/prisma/enums.js';

interface TranslationRow {
  locale: string;
  [key: string]: unknown;
}

interface ResourceRow {
  id: string;
  url: string;
  sizeKb: number;
  translations: TranslationRow[];
}

interface VideoRow {
  provider: VideoProvider;
  externalId: string;
  durationSeconds: number;
}

interface LessonRow {
  id: string;
  slug: string;
  isFreePreview: boolean;
  translations: TranslationRow[];
  video: VideoRow | null;
  resources: ResourceRow[];
}

interface SubmoduleRow {
  id: string;
  translations: TranslationRow[];
  lessons: LessonRow[];
}

interface ModuleRow {
  id: string;
  position: number;
  translations: TranslationRow[];
  submodules: SubmoduleRow[];
}

export interface CourseRow {
  id: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  coverImageUrl: string | null;
  level: CourseLevel;
  lessonCount: number;
  totalDurationSeconds: number;
  status: ContentStatus;
  isFeatured: boolean;
  hasCertificate: boolean;
  hasVoiceCorrection: boolean;
  translations: TranslationRow[];
  modules?: ModuleRow[];
}

function mapResource(resource: ResourceRow) {
  return {
    id: resource.id,
    title: buildI18nText(resource.translations, 'title'),
    description: buildI18nText(resource.translations, 'description'),
    sizeKb: resource.sizeKb,
    url: resource.url,
  };
}

function mapLesson(lesson: LessonRow) {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: buildI18nText(lesson.translations, 'title'),
    durationSeconds: lesson.video?.durationSeconds ?? 0,
    isFreePreview: lesson.isFreePreview,
    videoUrl: publicVideoUrl(lesson.video, lesson.isFreePreview),
    resources: lesson.resources.map(mapResource),
  };
}

function mapSubmodule(submodule: SubmoduleRow) {
  return {
    id: submodule.id,
    title: buildOptionalI18nText(submodule.translations, 'title') ?? null,
    lessons: submodule.lessons.map(mapLesson),
  };
}

function mapModule(module_: ModuleRow) {
  return {
    id: module_.id,
    order: module_.position,
    title: buildI18nText(module_.translations, 'title'),
    subModules: module_.submodules.map(mapSubmodule),
  };
}

export function mapCourse(course: CourseRow) {
  return {
    id: course.id,
    slug: course.slug,
    title: buildI18nText(course.translations, 'title'),
    subtitle: buildI18nText(course.translations, 'subtitle'),
    cardDescription: buildI18nText(course.translations, 'cardDescription'),
    heroTagline: buildOptionalI18nText(course.translations, 'heroTagline'),
    heroTaglineMobile: buildOptionalI18nText(course.translations, 'heroTaglineMobile'),
    description: buildI18nText(course.translations, 'description'),
    level: levelToFrontend(course.level),
    priceXof: course.price,
    compareAtPriceXof: course.compareAtPrice ?? undefined,
    coverUrl: course.coverImageUrl,
    lessonCount: course.lessonCount,
    totalDurationSeconds: course.totalDurationSeconds,
    modules: (course.modules ?? []).map(mapModule),
    status: courseStatusToFrontend(course.status),
    isFeatured: course.isFeatured,
    hasCertificate: course.hasCertificate,
    hasVoiceCorrection: course.hasVoiceCorrection,
    translationStatus: computeTranslationStatus(course.translations, [
      'title',
      'subtitle',
      'cardDescription',
      'description',
    ]),
  };
}
