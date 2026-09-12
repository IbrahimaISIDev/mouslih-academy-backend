import { Injectable } from '@nestjs/common';
import { WavePaymentProvider, type WaveCheckoutParams } from './wave-payment.provider.js';

/**
 * En l'absence d'identifiants marchand Wave, pointe directement vers notre propre écran de
 * confirmation (chemin relatif, résolu par le frontend) — même comportement que le mock
 * actuel (features/checkout/api/create-order.ts). OrdersService simule aussi la confirmation
 * du paiement après un court délai (voir OrdersService.AUTO_CONFIRM_AFTER_MS), pour que le
 * parcours complet reste testable de bout en bout sans vraie passerelle de paiement.
 */
@Injectable()
export class WaveStubProvider extends WavePaymentProvider {
  async createCheckoutUrl({ orderRef }: WaveCheckoutParams): Promise<string> {
    return `/commande/${orderRef}/confirmation`;
  }
}
