import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminCourseEditorController } from './admin-course-editor.controller.js';
import { AdminCourseEditorService } from './admin-course-editor.service.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminDashboardController, AdminCourseEditorController],
  providers: [AdminDashboardService, AdminCourseEditorService],
})
export class AdminModule {}
