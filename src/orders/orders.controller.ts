import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.userId, dto);
  }

  @Get(':ref')
  findByRef(@CurrentUser() user: AuthenticatedUser, @Param('ref') ref: string) {
    return this.ordersService.getOrder(user.userId, ref);
  }
}
