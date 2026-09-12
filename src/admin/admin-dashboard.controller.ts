import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { GetRecentPaymentsQuery } from './dto/get-recent-payments.query.js';
import { ListAdminOrdersQuery } from './dto/list-admin-orders.query.js';
import { ListAdminUsersQuery } from './dto/list-admin-users.query.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  getStats(@Query('range') range: string = '30d') {
    return this.adminDashboardService.getStats(range);
  }

  @Get('orders')
  listOrders(@Query() query: ListAdminOrdersQuery) {
    return this.adminDashboardService.listOrders(query);
  }

  @Get('orders/recent')
  recentPayments(@Query() query: GetRecentPaymentsQuery) {
    return this.adminDashboardService.recentPayments(query);
  }

  @Get('users')
  listUsers(@Query() query: ListAdminUsersQuery) {
    return this.adminDashboardService.listUsers(query);
  }

  @Get('users/recent-signups')
  recentSignups() {
    return this.adminDashboardService.recentSignups();
  }
}
