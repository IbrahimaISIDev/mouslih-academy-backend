import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ListCoursesQuery } from './dto/list-courses.query.js';
import { levelFromFrontend } from './mappers/enums.js';
import { mapCourse } from './mappers/course.mapper.js';
import { COURSE_DETAIL_INCLUDE as DETAIL_INCLUDE } from './mappers/course-detail.include.js';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCoursesQuery) {
    const level = query.level ? levelFromFrontend(query.level) : undefined;

    const courses = await this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(level ? { level } : {}),
        ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
        ...(query.q
          ? {
              translations: {
                some: {
                  OR: [
                    { title: { contains: query.q, mode: 'insensitive' } },
                    { subtitle: { contains: query.q, mode: 'insensitive' } },
                    { cardDescription: { contains: query.q, mode: 'insensitive' } },
                  ],
                },
              },
            }
          : {}),
      },
      // Le mock frontend (src/mocks/courses.ts) n'a jamais fait de distinction "liste légère"
      // / "détail complet" : ce sont les mêmes objets Course, modules inclus. Le tableau de bord
      // (reprise de la leçon en cours) a besoin de parcourir modules/sous-modules/leçons même à
      // partir de la liste catalogue — pas seulement depuis findBySlug/findById.
      include: DETAIL_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });

    return courses.map((course) => mapCourse(course));
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: DETAIL_INCLUDE,
    });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPurchasesCount = await this.prisma.orderItem.count({
      where: { courseId: course.id, order: { status: 'PAID', createdAt: { gte: sevenDaysAgo } } },
    });

    return mapCourse(course, recentPurchasesCount);
  }

  async findById(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: DETAIL_INCLUDE,
    });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }
    return mapCourse(course);
  }

  /** Statistiques publiques (accueil, page d'inscription) — aucune donnée sensible, uniquement
   *  des compteurs agrégés, pour remplacer des chiffres marketing codés en dur. */
  async publicStats() {
    const [learnersCount, coursesCount] = await Promise.all([
      this.prisma.user.count({ where: { role: 'LEARNER' } }),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
    ]);
    return { learnersCount, coursesCount };
  }
}
