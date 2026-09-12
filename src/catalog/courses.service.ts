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
      include: { translations: true },
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
    return mapCourse(course);
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
}
