import type { LessonProgressStatus } from '../../generated/prisma/enums.js';

interface LessonProgressRow {
  status: LessonProgressStatus;
  lastPositionSeconds: number | null;
  updatedAt: Date;
}

interface LessonRow {
  id: string;
  lessonProgresses: LessonProgressRow[];
}

interface EnrollmentRow {
  courseId: string;
  completedAt: Date | null;
  course: {
    modules: {
      submodules: {
        lessons: LessonRow[];
      }[];
    }[];
  };
}

export function mapEnrollment(enrollment: EnrollmentRow) {
  const lessons = enrollment.course.modules.flatMap((m) => m.submodules.flatMap((sm) => sm.lessons));
  const completedLessonIds = lessons
    .filter((lesson) => lesson.lessonProgresses[0]?.status === 'COMPLETED')
    .map((lesson) => lesson.id);
  const current = lessons.find((lesson) => lesson.lessonProgresses[0]?.status === 'IN_PROGRESS');

  // Activité la plus récente sur cette formation, tous statuts de progression confondus — sert
  // à afficher un "vu il y a X jours" réel plutôt qu'une valeur inventée côté frontend.
  const lastActivityAt = lessons
    .flatMap((lesson) => lesson.lessonProgresses)
    .reduce<Date | null>((latest, progress) => {
      if (!latest || progress.updatedAt > latest) return progress.updatedAt;
      return latest;
    }, null);

  return {
    courseId: enrollment.courseId,
    completedLessonIds,
    currentLessonId: current?.id ?? '',
    resumeAtSeconds: current?.lessonProgresses[0]?.lastPositionSeconds ?? 0,
    completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
    lastActivityAt: lastActivityAt ? lastActivityAt.toISOString() : null,
  };
}
