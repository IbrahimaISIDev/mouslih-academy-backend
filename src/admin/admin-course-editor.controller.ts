import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminCourseEditorService } from './admin-course-editor.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { ReorderCourseDto } from './dto/reorder-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCourseEditorController {
  constructor(private readonly adminCourseEditorService: AdminCourseEditorService) {}

  @Get()
  list() {
    return this.adminCourseEditorService.list();
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.adminCourseEditorService.create(dto);
  }

  @Get(':id/editor')
  getCourseEditor(@Param('id') id: string) {
    return this.adminCourseEditorService.getCourseEditor(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.adminCourseEditorService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.adminCourseEditorService.remove(id);
  }

  @Post(':id/reorder')
  @HttpCode(204)
  async reorder(@Param('id') id: string, @Body() dto: ReorderCourseDto): Promise<void> {
    await this.adminCourseEditorService.reorder(id, dto);
  }
}
