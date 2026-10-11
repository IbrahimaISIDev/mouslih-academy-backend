/**
 * Contenu de « Rectifiez votre Fâtiḥah » (formation, traductions, programme, erreurs) — partagé
 * entre le seed de démo (prisma/seed.ts) et la mise à jour de production
 * (prisma/sync-fatiha.ts), pour qu'ils ne divergent jamais. Ne crée ni compte, ni commande, ni
 * témoignage.
 */
import type { PrismaClient } from '../src/generated/prisma/client.js';
import {
  FATIHA_PLACEHOLDER_YOUTUBE_ID,
  FATIHA_TOTAL_DURATION_SECONDS,
  fatihaCourseText,
  fatihaLessons,
  fatihaModule,
} from './fatiha-content.js';

const LOCALES = ['fr', 'en', 'ar'] as const;
const toDbLocale = (locale: (typeof LOCALES)[number]) =>
  locale.toUpperCase() as 'FR' | 'EN' | 'AR';

export const FATIHA_COURSE_ID = 'c-rectification-fatiha';
export const FATIHA_PRICE = 10150;

/**
 * Formation + traductions + programme complet. Idempotent : relançable sans risque.
 * Préserve ce qui se gère depuis l'admin : image de couverture déjà choisie, et vidéo déjà
 * rattachée à une leçon (la vidéo d'exemple ne remplace qu'une absence de vidéo ou l'ancienne
 * vidéo provisoire unique).
 */
export async function syncFatihaCourse(prisma: PrismaClient): Promise<void> {
  const courseFields = {
    price: FATIHA_PRICE,
    compareAtPrice: null,
    level: 'BEGINNER' as const,
    lessonCount: fatihaLessons.length,
    totalDurationSeconds: FATIHA_TOTAL_DURATION_SECONDS,
    status: 'PUBLISHED' as const,
    isFeatured: true,
    // Exercices, correction vocale et attestation : masqués tant que l'offre se limite aux
    // 5 vidéos (décision du 2026-10-10).
    hasCertificate: false,
    hasVoiceCorrection: false,
  };
  await prisma.course.upsert({
    where: { id: FATIHA_COURSE_ID },
    update: courseFields,
    create: {
      id: FATIHA_COURSE_ID,
      slug: 'rectification-fatiha',
      coverImageUrl: '/images/courses/rectification-fatiha.jpg',
      ...courseFields,
    },
  });

  for (const locale of LOCALES) {
    const fields = {
      title: fatihaCourseText.title[locale],
      subtitle: fatihaCourseText.subtitle[locale],
      cardDescription: fatihaCourseText.cardDescription[locale],
      heroTagline: fatihaCourseText.heroTagline[locale],
      heroTaglineMobile: fatihaCourseText.heroTaglineMobile[locale],
      description: fatihaCourseText.description[locale],
    };
    await prisma.courseTranslation.upsert({
      where: {
        courseId_locale: {
          courseId: FATIHA_COURSE_ID,
          locale: toDbLocale(locale),
        },
      },
      update: fields,
      create: {
        courseId: FATIHA_COURSE_ID,
        locale: toDbLocale(locale),
        ...fields,
      },
    });
  }

  // Retire l'ancien programme (4 modules, 11 leçons) — la cascade emporte leçons, vidéos,
  // progression, questions et récitations rattachées.
  await prisma.module.deleteMany({
    where: { courseId: FATIHA_COURSE_ID, id: { not: fatihaModule.id } },
  });

  await prisma.module.upsert({
    where: { id: fatihaModule.id },
    update: { position: 1, status: 'PUBLISHED' },
    create: {
      id: fatihaModule.id,
      courseId: FATIHA_COURSE_ID,
      position: 1,
      status: 'PUBLISHED',
    },
  });
  for (const locale of LOCALES) {
    await prisma.moduleTranslation.upsert({
      where: {
        moduleId_locale: {
          moduleId: fatihaModule.id,
          locale: toDbLocale(locale),
        },
      },
      update: { title: fatihaModule.title[locale] },
      create: {
        moduleId: fatihaModule.id,
        locale: toDbLocale(locale),
        title: fatihaModule.title[locale],
      },
    });
  }

  await prisma.submodule.upsert({
    where: { id: fatihaModule.subModuleId },
    update: { position: 1, status: 'PUBLISHED' },
    create: {
      id: fatihaModule.subModuleId,
      moduleId: fatihaModule.id,
      position: 1,
      status: 'PUBLISHED',
    },
  });
  await prisma.lesson.deleteMany({
    where: {
      submoduleId: fatihaModule.subModuleId,
      id: { notIn: fatihaLessons.map((l) => l.id) },
    },
  });

  for (const [index, lesson] of fatihaLessons.entries()) {
    const lessonFields = {
      slug: lesson.slug,
      position: index + 1,
      status: 'PUBLISHED' as const,
      isFreePreview: lesson.isFreePreview,
      passage: lesson.passage,
    };
    await prisma.lesson.upsert({
      where: { id: lesson.id },
      update: lessonFields,
      create: {
        id: lesson.id,
        submoduleId: fatihaModule.subModuleId,
        ...lessonFields,
      },
    });

    for (const locale of LOCALES) {
      const fields = {
        title: lesson.title[locale],
        description: lesson.description[locale],
        objective: lesson.objective[locale],
        keyPoints: lesson.keyPoints.map((point) => point[locale]),
      };
      await prisma.lessonTranslation.upsert({
        where: {
          lessonId_locale: { lessonId: lesson.id, locale: toDbLocale(locale) },
        },
        update: fields,
        create: { lessonId: lesson.id, locale: toDbLocale(locale), ...fields },
      });
    }

    // Vidéo d'exemple de la leçon : posée si la leçon n'a pas de vidéo, ou si elle a encore
    // l'ancienne vidéo provisoire unique. Un lien saisi depuis l'admin n'est jamais écrasé.
    const video = {
      provider: 'YOUTUBE' as const,
      externalId: lesson.youtubeId,
      durationSeconds: lesson.durationSeconds,
      status: 'READY' as const,
    };
    const current = await prisma.video.findUnique({
      where: { lessonId: lesson.id },
      select: { externalId: true },
    });
    if (!current) {
      await prisma.video.create({ data: { lessonId: lesson.id, ...video } });
    } else if (current.externalId === FATIHA_PLACEHOLDER_YOUTUBE_ID) {
      await prisma.video.update({
        where: { lessonId: lesson.id },
        data: video,
      });
    }

    await prisma.lessonMistake.deleteMany({ where: { lessonId: lesson.id } });
    for (const [position, mistake] of lesson.mistakes.entries()) {
      await prisma.lessonMistake.create({
        data: {
          lessonId: lesson.id,
          position: position + 1,
          passage: mistake.passage,
          translations: {
            create: LOCALES.map((locale) => ({
              locale: toDbLocale(locale),
              title: mistake.title[locale],
              mistake: mistake.mistake[locale],
              correction: mistake.correction[locale],
              rule: mistake.rule[locale],
            })),
          },
        },
      });
    }
  }

  await refreshFatihaTotals(prisma);
}

/** Totaux dénormalisés recalculés depuis les vraies vidéos (durées éventuellement corrigées
 *  depuis l'admin), comme le fait l'éditeur admin après chaque modification du programme. */
async function refreshFatihaTotals(prisma: PrismaClient): Promise<void> {
  const lessons = await prisma.lesson.findMany({
    where: { submodule: { module: { courseId: FATIHA_COURSE_ID } } },
    select: { video: { select: { durationSeconds: true } } },
  });
  await prisma.course.update({
    where: { id: FATIHA_COURSE_ID },
    data: {
      lessonCount: lessons.length,
      totalDurationSeconds: lessons.reduce(
        (sum, l) => sum + (l.video?.durationSeconds ?? 0),
        0,
      ),
    },
  });
}

/** Masque (brouillon, hors vedette) toutes les autres formations — sans rien supprimer. */
export async function hideOtherCourses(prisma: PrismaClient): Promise<number> {
  const result = await prisma.course.updateMany({
    where: { id: { not: FATIHA_COURSE_ID } },
    data: { status: 'DRAFT', isFeatured: false },
  });
  return result.count;
}
