import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonPlaybackService, type LessonPlayback } from '../media/lesson-playback.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapLessonQuestion } from './mappers/lesson-question.mapper.js';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playback: LessonPlaybackService,
  ) {}

  /** Vidéo en accès libre d'une formation publiée : lisible sans compte. Toute autre leçon → 404
   *  (même réponse qu'une leçon inexistante, pour ne rien révéler). */
  async getPublicPlayback(lessonId: string): Promise<LessonPlayback> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { video: true, submodule: { include: { module: { include: { course: true } } } } },
    });
    if (!lesson || !lesson.isFreePreview || lesson.submodule.module.course.status !== 'PUBLISHED') {
      throw new NotFoundException('Leçon introuvable');
    }
    return this.playback.resolve(lesson.video);
  }

  async listQuestions(lessonId: string) {
    const questions = await this.prisma.lessonQuestion.findMany({
      where: { lessonId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        answeredBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return questions.map(mapLessonQuestion);
  }
}
