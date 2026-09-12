import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapTestimonial } from './mappers/testimonial.mapper.js';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const testimonials = await this.prisma.testimonial.findMany({
      where: { isPublished: true },
      include: { translations: true },
      orderBy: { createdAt: 'asc' },
    });
    return testimonials.map(mapTestimonial);
  }
}
