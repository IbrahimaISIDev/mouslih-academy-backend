import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { UsersService } from './users.service.js';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Get('orders')
  getPurchaseHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getPurchaseHistory(user.userId);
  }
}
