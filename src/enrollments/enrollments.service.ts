import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapEnrollment } from './mappers/enrollment.mapper.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { position: 'asc' },
              include: {
                submodules: {
                  orderBy: { position: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { position: 'asc' },
                      include: { lessonProgresses: { where: { userId } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return enrollments.map(mapEnrollment);
  }

  async completeLesson(userId: string, lessonId: string): Promise<{ progressPct: number }> {
    const { courseId, enrollment } = await this.assertOwnership(userId, lessonId);

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: 'COMPLETED', completedAt: new Date() },
      create: { userId, lessonId, status: 'COMPLETED', completedAt: new Date() },
    });

    const [totalLessons, completedCount] = await Promise.all([
      this.prisma.lesson.count({ where: { submodule: { module: { courseId } } } }),
      this.prisma.lessonProgress.count({
        where: { userId, status: 'COMPLETED', lesson: { submodule: { module: { courseId } } } },
      }),
    ]);

    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (progressPct === 100 && !enrollment.completedAt) {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: new Date() },
      });
    }

    return { progressPct };
  }

  async savePosition(userId: string, lessonId: string, positionSeconds: number): Promise<void> {
    await this.assertOwnership(userId, lessonId);

    const existing = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing?.status === 'COMPLETED') {
      // Une leçon déjà terminée peut être revisionnée : on garde le statut, on met juste à jour
      // la position, plutôt que de la repasser en "en cours".
      await this.prisma.lessonProgress.update({
        where: { id: existing.id },
        data: { lastPositionSeconds: positionSeconds },
      });
      return;
    }

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: 'IN_PROGRESS', lastPositionSeconds: positionSeconds },
      create: { userId, lessonId, status: 'IN_PROGRESS', lastPositionSeconds: positionSeconds },
    });
  }

  /** Une leçon n'est accessible en progression que si son cours fait partie d'un enrollment actif. */
  private async assertOwnership(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { submodule: { include: { module: true } } },
    });
    if (!lesson) {
      throw new NotFoundException('Leçon non trouvée dans une formation possédée');
    }

    const courseId = lesson.submodule.module.courseId;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new NotFoundException('Leçon non trouvée dans une formation possédée');
    }

    return { courseId, enrollment };
  }
}
