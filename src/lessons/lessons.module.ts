import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { LessonsController } from './lessons.controller.js';
import { LessonsService } from './lessons.service.js';

@Module({
  imports: [MediaModule],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
