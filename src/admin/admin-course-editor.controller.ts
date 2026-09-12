import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminCourseEditorService } from './admin-course-editor.service.js';
import { ReorderCourseDto } from './dto/reorder-course.dto.js';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCourseEditorController {
  constructor(private readonly adminCourseEditorService: AdminCourseEditorService) {}

  @Get(':id/editor')
  getCourseEditor(@Param('id') id: string) {
    return this.adminCourseEditorService.getCourseEditor(id);
  }

  @Post(':id/reorder')
  @HttpCode(204)
  async reorder(@Param('id') id: string, @Body() dto: ReorderCourseDto): Promise<void> {
    await this.adminCourseEditorService.reorder(id, dto);
  }
}
