import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { COURSE_DETAIL_INCLUDE } from '../catalog/mappers/course-detail.include.js';
import { mapCourse } from '../catalog/mappers/course.mapper.js';
import { levelFromFrontend } from '../catalog/mappers/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ReorderCourseDto } from './dto/reorder-course.dto.js';
import type { UpdateCourseDto } from './dto/update-course.dto.js';
import type { CreateCourseDto } from './dto/create-course.dto.js';
import type { CreateModuleDto } from './dto/create-module.dto.js';
import type { CreateLessonDto } from './dto/create-lesson.dto.js';

const LOCALES = ['fr', 'en', 'ar'] as const;

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AdminCourseEditorService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const courses = await this.prisma.course.findMany({
      include: COURSE_DETAIL_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
    return courses.map((course) => mapCourse(course));
  }

  async create(dto: CreateCourseDto) {
    const baseSlug = slugify(dto.title) || 'formation';
    let slug = baseSlug;
    let suffix = 2;
    while (await this.prisma.course.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const course = await this.prisma.course.create({
      data: {
        slug,
        price: 0,
        status: 'DRAFT',
        translations: {
          create: LOCALES.map((locale) => ({
            locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
            title: locale === 'fr' ? dto.title : '',
            subtitle: '',
            cardDescription: '',
            description: '',
          })),
        },
      },
      include: COURSE_DETAIL_INCLUDE,
    });

    return mapCourse(course);
  }

  async update(courseId: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    const level = dto.level ? levelFromFrontend(dto.level) : undefined;

    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        ...(level ? { level } : {}),
        ...(dto.priceXof !== undefined ? { price: dto.priceXof } : {}),
        ...(dto.compareAtPriceXof !== undefined ? { compareAtPrice: dto.compareAtPriceXof } : {}),
        ...(dto.hasCertificate !== undefined ? { hasCertificate: dto.hasCertificate } : {}),
        ...(dto.hasVoiceCorrection !== undefined ? { hasVoiceCorrection: dto.hasVoiceCorrection } : {}),
        ...(dto.status ? { status: dto.status === 'published' ? 'PUBLISHED' : 'DRAFT' } : {}),
      },
    });

    if (dto.translations) {
      for (const locale of LOCALES) {
        const fields = dto.translations[locale];
        if (!fields) continue;

        const data = {
          ...(fields.title !== undefined ? { title: fields.title } : {}),
          ...(fields.subtitle !== undefined ? { subtitle: fields.subtitle } : {}),
          ...(fields.description !== undefined ? { description: fields.description } : {}),
        };
        if (Object.keys(data).length === 0) continue;

        await this.prisma.courseTranslation.upsert({
          where: { courseId_locale: { courseId, locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR' } },
          create: {
            courseId,
            locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
            title: fields.title ?? '',
            subtitle: fields.subtitle ?? '',
            cardDescription: '',
            description: fields.description ?? '',
          },
          update: data,
        });
      }
    }

    return this.getCourseEditor(courseId);
  }

  async setCover(courseId: string, coverImageUrl: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    await this.prisma.course.update({ where: { id: courseId }, data: { coverImageUrl } });
    return this.getCourseEditor(courseId);
  }

  async addModule(courseId: string, dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    const position = (await this.prisma.module.count({ where: { courseId } })) + 1;

    await this.prisma.module.create({
      data: {
        courseId,
        position,
        status: 'DRAFT',
        translations: { create: [{ locale: 'FR', title: dto.title }] },
        // Un sous-module par défaut, sans traduction (titre `null` côté frontend) : les leçons
        // s'y rattachent directement, comme pour les modules à thème unique du seed (Fatiha).
        submodules: { create: [{ position: 1, status: 'DRAFT' }] },
      },
    });

    return this.getCourseEditor(courseId);
  }

  async addLesson(courseId: string, moduleId: string, subModuleId: string, dto: CreateLessonDto) {
    const submodule = await this.prisma.submodule.findFirst({
      where: { id: subModuleId, moduleId, module: { courseId } },
      select: { id: true },
    });
    if (!submodule) {
      throw new NotFoundException('Sous-module introuvable pour cette formation');
    }

    const baseSlug = slugify(dto.title) || 'lecon';
    let slug = baseSlug;
    let suffix = 2;
    while (await this.prisma.lesson.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const position = (await this.prisma.lesson.count({ where: { submoduleId: subModuleId } })) + 1;

    await this.prisma.lesson.create({
      data: {
        slug,
        submoduleId: subModuleId,
        position,
        status: 'DRAFT',
        isFreePreview: false,
        translations: { create: [{ locale: 'FR', title: dto.title }] },
      },
    });

    return this.getCourseEditor(courseId);
  }

  async remove(courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    try {
      await this.prisma.course.delete({ where: { id: courseId } });
    } catch {
      // OrderItem/Enrollment pointent vers Course en onDelete: Restrict (schema.prisma) : des
      // ventes/inscriptions existantes bloquent la suppression physique, volontairement.
      throw new ConflictException(
        'Impossible de supprimer cette formation : des commandes ou inscriptions y sont rattachées.',
      );
    }
  }

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
