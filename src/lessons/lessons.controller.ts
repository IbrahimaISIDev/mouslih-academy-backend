import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service.js';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /** Lecture publique, réservée aux vidéos en accès libre (404 pour une vidéo payante). */
  @Get(':id/playback')
  publicPlayback(@Param('id') lessonId: string) {
    return this.lessonsService.getPublicPlayback(lessonId);
  }

  @Get(':id/questions')
  listQuestions(@Param('id') lessonId: string) {
    return this.lessonsService.listQuestions(lessonId);
  }
}
