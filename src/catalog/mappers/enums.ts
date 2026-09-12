import type { ContentStatus, CourseLevel, TestimonialKind } from '../../generated/prisma/enums.js';

const LEVEL_TO_FRONTEND: Record<CourseLevel, 'beginner' | 'intermediate' | 'advanced'> = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

const LEVEL_FROM_FRONTEND: Record<string, CourseLevel> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
};

export function levelToFrontend(level: CourseLevel): 'beginner' | 'intermediate' | 'advanced' {
  return LEVEL_TO_FRONTEND[level];
}

export function levelFromFrontend(level: string): CourseLevel | undefined {
  return LEVEL_FROM_FRONTEND[level];
}

/** UNPUBLISHED n'existe pas côté frontend (CourseStatus = 'draft' | 'published') : traité comme brouillon. */
export function courseStatusToFrontend(status: ContentStatus): 'draft' | 'published' {
  return status === 'PUBLISHED' ? 'published' : 'draft';
}

export function testimonialKindToFrontend(kind: TestimonialKind): 'text' | 'video' {
  return kind === 'VIDEO' ? 'video' : 'text';
}
