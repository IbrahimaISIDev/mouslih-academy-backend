import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { ListCoursesQuery } from './dto/list-courses.query.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  list(@Query() query: ListCoursesQuery) {
    return this.coursesService.list(query);
  }

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Get('stats')
  publicStats() {
    return this.coursesService.publicStats();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}
