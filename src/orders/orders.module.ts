import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EmailModule } from '../email/email.module.js';
import { OrdersController } from './orders.controller.js';
import { WaveWebhookController } from './wave-webhook.controller.js';
import { OrdersService } from './orders.service.js';
import { WavePaymentProvider } from './payments/wave-payment.provider.js';
import { WaveStubProvider } from './payments/wave-stub.provider.js';
import { WaveApiProvider } from './payments/wave-api.provider.js';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [OrdersController, WaveWebhookController],
  providers: [
    OrdersService,
    {
      provide: WavePaymentProvider,
      // Bascule automatique : dès que WAVE_API_KEY est renseignée (vrai compte marchand), plus
      // aucun code à toucher ici ni dans OrdersService.
      useClass: process.env['WAVE_API_KEY'] ? WaveApiProvider : WaveStubProvider,
    },
  ],
})
export class OrdersModule {}
