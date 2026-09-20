import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { LessonsModule } from './lessons/lessons.module.js';
import { MediaModule } from './media/media.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Garde-fou par défaut contre le brute-force / abus (100 req / min / IP) — AuthController
    // resserre encore cette limite sur signup/login/refresh via @Throttle(), plus sensibles.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // Sert les couvertures uploadées par l'admin (voir AdminCourseEditorController.uploadCover)
    // sur /uploads/* — un stockage local temporaire, hors préfixe /api volontairement, en
    // attendant un vrai stockage objet (Cloudflare R2, cf. DATA-MODEL.md). UPLOADS_DIR permet de
    // pointer vers un disque persistant en production (voir DEPLOYMENT.md) ; par défaut,
    // identique au dossier local utilisé en dev.
    ServeStaticModule.forRoot({
      rootPath: process.env['UPLOADS_DIR'] ?? join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    EnrollmentsModule,
    LessonsModule,
    MediaModule,
    OrdersModule,
    AdminModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
