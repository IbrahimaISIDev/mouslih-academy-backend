import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminCourseEditorService } from './admin-course-editor.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { ReorderCourseDto } from './dto/reorder-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';

const COVERS_DIR = join(process.cwd(), 'uploads', 'covers');
const ALLOWED_COVER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// L'URL stockée doit être absolue : contrairement aux couvertures de démo (servies par le
// frontend depuis public/images/), un fichier uploadé ici vit sur CETTE API, une origine
// différente du frontend — un chemin relatif comme /uploads/covers/x.jpg se résoudrait sinon
// contre le domaine du frontend et 404 silencieusement.
const PUBLIC_URL = process.env['PUBLIC_URL'] ?? `http://127.0.0.1:${process.env['PORT'] ?? 3001}`;

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

  @Post(':id/modules')
  addModule(@Param('id') id: string, @Body() dto: CreateModuleDto) {
    return this.adminCourseEditorService.addModule(id, dto);
  }

  @Patch(':id/modules/:moduleId')
  updateModule(@Param('id') id: string, @Param('moduleId') moduleId: string, @Body() dto: UpdateModuleDto) {
    return this.adminCourseEditorService.updateModule(id, moduleId, dto);
  }

  @Delete(':id/modules/:moduleId')
  removeModule(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return this.adminCourseEditorService.removeModule(id, moduleId);
  }

  @Post(':id/modules/:moduleId/submodules/:subModuleId/lessons')
  addLesson(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Param('subModuleId') subModuleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.adminCourseEditorService.addLesson(id, moduleId, subModuleId, dto);
  }

  @Patch(':id/modules/:moduleId/submodules/:subModuleId/lessons/:lessonId')
  updateLesson(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Param('subModuleId') subModuleId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.adminCourseEditorService.updateLesson(id, moduleId, subModuleId, lessonId, dto);
  }

  @Delete(':id/modules/:moduleId/submodules/:subModuleId/lessons/:lessonId')
  removeLesson(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Param('subModuleId') subModuleId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.adminCourseEditorService.removeLesson(id, moduleId, subModuleId, lessonId);
  }

  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(COVERS_DIR, { recursive: true });
          cb(null, COVERS_DIR);
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED_COVER_MIME_TYPES.has(file.mimetype));
      },
    }),
  )
  uploadCover(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Image manquante ou format non pris en charge (jpg, png, webp, 5 Mo max).");
    }
    return this.adminCourseEditorService.setCover(id, `${PUBLIC_URL}/uploads/covers/${file.filename}`);
  }
}
