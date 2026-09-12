import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { SavePositionDto } from './dto/save-position.dto.js';
import { EnrollmentsService } from './enrollments.service.js';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('enrollments')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.enrollmentsService.listForUser(user.userId);
  }

  @Post('lessons/:id/complete')
  completeLesson(@CurrentUser() user: AuthenticatedUser, @Param('id') lessonId: string) {
    return this.enrollmentsService.completeLesson(user.userId, lessonId);
  }

  @Post('lessons/:id/position')
  @HttpCode(204)
  async savePosition(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') lessonId: string,
    @Body() dto: SavePositionDto,
  ): Promise<void> {
    await this.enrollmentsService.savePosition(user.userId, lessonId, dto.positionSeconds);
  }
}
