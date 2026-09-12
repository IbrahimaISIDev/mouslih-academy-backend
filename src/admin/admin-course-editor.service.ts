import { Injectable, NotFoundException } from '@nestjs/common';
import { COURSE_DETAIL_INCLUDE } from '../catalog/mappers/course-detail.include.js';
import { mapCourse } from '../catalog/mappers/course.mapper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ReorderCourseDto } from './dto/reorder-course.dto.js';

@Injectable()
export class AdminCourseEditorService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseEditor(courseId: string) {
    // Contrairement au catalogue public, l'admin doit pouvoir voir/éditer une formation en
    // brouillon (pas de filtre status: PUBLISHED ici).
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: COURSE_DETAIL_INCLUDE,
    });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    const lessons = course.modules.flatMap((m) => m.submodules.flatMap((sm) => sm.lessons));
    const videoStatus: Record<string, { status: 'ready' | 'uploading' | 'missing'; uploadPct?: number }> = {};
    for (const lesson of lessons) {
      videoStatus[lesson.id] = { status: lessonVideoStatus(lesson.video) };
    }

    return { course: mapCourse(course), videoStatus };
  }

  async reorder(courseId: string, dto: ReorderCourseDto): Promise<void> {
    if (dto.scope === 'modules') {
      const modules = await this.prisma.module.findMany({
        where: { courseId, id: { in: dto.orderedIds } },
        select: { id: true },
      });
      if (modules.length !== dto.orderedIds.length) {
        throw new NotFoundException('Modules introuvables pour cette formation');
      }

      await this.prisma.$transaction(
        dto.orderedIds.map((id, index) =>
          this.prisma.module.update({ where: { id }, data: { position: index + 1 } }),
        ),
      );
      return;
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { submoduleId: dto.subModuleId, id: { in: dto.orderedIds } },
      select: { id: true },
    });
    if (lessons.length !== dto.orderedIds.length) {
      throw new NotFoundException('Leçons introuvables pour ce sous-module');
    }

    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.lesson.update({ where: { id }, data: { position: index + 1 } }),
      ),
    );
  }
}

function lessonVideoStatus(video: { status: string } | null): 'ready' | 'uploading' | 'missing' {
  if (!video) return 'missing';
  if (video.status === 'READY') return 'ready';
  if (video.status === 'PROCESSING') return 'uploading';
  return 'missing';
}
