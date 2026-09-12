import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service.js';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id/questions')
  listQuestions(@Param('id') lessonId: string) {
    return this.lessonsService.listQuestions(lessonId);
  }
}
