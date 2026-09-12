import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

// PassportModule.register(...) est ce qui fournit AuthModuleOptions, requis par AuthGuard('jwt')
// (JwtAuthGuard) — un import "nu" de PassportModule ne suffit pas. On réexporte cette même
// instance dynamique pour que les modules qui importent AuthModule puissent utiliser
// JwtAuthGuard sans avoir à réimporter PassportModule eux-mêmes.
const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Module({
  imports: [passportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, passportModule, RolesGuard],
})
export class AuthModule {}
