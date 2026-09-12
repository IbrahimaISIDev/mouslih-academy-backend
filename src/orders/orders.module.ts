import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { WavePaymentProvider } from './payments/wave-payment.provider.js';
import { WaveStubProvider } from './payments/wave-stub.provider.js';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, { provide: WavePaymentProvider, useClass: WaveStubProvider }],
})
export class OrdersModule {}
