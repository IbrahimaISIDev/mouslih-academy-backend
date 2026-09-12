import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapLessonQuestion } from './mappers/lesson-question.mapper.js';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

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
