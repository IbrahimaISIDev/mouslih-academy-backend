import { BadRequestException, Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service.js';
import { WAVE_SIGNATURE_HEADER, verifyWaveSignature } from './payments/verify-wave-signature.js';

/**
 * Endpoint public (pas de JwtAuthGuard — Wave n'a pas de jeton utilisateur) appelé par Wave à
 * chaque changement de statut de paiement. Forme du payload écrite sur la documentation Wave la
 * plus courante ("type" + "data.client_reference") — à confirmer contre la charge utile réelle
 * reçue au premier webhook effectif, jamais observée faute de compte marchand.
 */
@Controller('webhooks/wave')
export class WaveWebhookController {
  private readonly logger = new Logger(WaveWebhookController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() request: RawBodyRequest<Request>,
    @Headers(WAVE_SIGNATURE_HEADER) signature: string | undefined,
  ): Promise<{ received: true }> {
    const secret = process.env['WAVE_WEBHOOK_SECRET'];
    if (!secret) {
      this.logger.error('Webhook Wave reçu mais WAVE_WEBHOOK_SECRET absent — rejeté par sécurité.');
      throw new BadRequestException('Webhook non configuré');
    }

    const rawBody = request.rawBody;
    if (!rawBody || !verifyWaveSignature(rawBody, signature, secret)) {
      this.logger.warn('Webhook Wave reçu avec une signature invalide ou absente.');
      throw new BadRequestException('Signature invalide');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      type?: string;
      data?: { client_reference?: string; payment_status?: string };
    };

    const ref = event.data?.client_reference;
    const isSuccess = event.type === 'checkout.session.completed' || event.data?.payment_status === 'succeeded';

    if (ref && isSuccess) {
      await this.ordersService.confirmPaymentByRef(ref);
    } else {
      this.logger.log(`Webhook Wave ignoré (type=${event.type}, ref=${ref ?? 'n/a'}) — pas un succès de paiement.`);
    }

    return { received: true };
  }
}
