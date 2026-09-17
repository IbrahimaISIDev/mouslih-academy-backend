import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';
import { ReceiptService } from './receipt.service.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.userId, dto);
  }

  @Get(':ref')
  findByRef(@CurrentUser() user: AuthenticatedUser, @Param('ref') ref: string) {
    return this.ordersService.getOrder(user.userId, ref);
  }

  @Get(':ref/receipt')
  async downloadReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('ref') ref: string,
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.ordersService.getReceiptData(user.userId, ref);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="recu-${ref}.pdf"`);
    this.receiptService.generatePdf(data).pipe(res);
  }
}
