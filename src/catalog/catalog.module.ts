import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { TestimonialsController } from './testimonials.controller.js';
import { TestimonialsService } from './testimonials.service.js';

@Module({
  controllers: [CoursesController, TestimonialsController],
  providers: [CoursesService, TestimonialsService],
  exports: [CoursesService],
})
export class CatalogModule {}
