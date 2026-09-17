import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { WavePaymentProvider, type WaveCheckoutParams } from './wave-payment.provider.js';

const WAVE_API_BASE_URL = 'https://api.wave.com/v1';

interface WaveCheckoutSessionResponse {
  id: string;
  wave_launch_url: string;
}

/**
 * Appelle la vraie API Wave Checkout (https://docs.wave.com/business/api — à revérifier contre
 * la doc à jour au moment du premier vrai test : cette implémentation est écrite à partir de la
 * forme documentée de l'API, jamais testée contre un compte marchand réel faute d'identifiants).
 * Sélectionnée automatiquement par OrdersModule dès que WAVE_API_KEY est renseignée.
 */
@Injectable()
export class WaveApiProvider extends WavePaymentProvider {
  private readonly logger = new Logger(WaveApiProvider.name);
  readonly isSimulated = false;

  private readonly apiKey = process.env['WAVE_API_KEY']!;
  private readonly frontendUrl = (process.env['FRONTEND_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');

  async createCheckoutUrl({ orderRef, amountXof }: WaveCheckoutParams): Promise<string> {
    const response = await fetch(`${WAVE_API_BASE_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amountXof),
        currency: 'XOF',
        client_reference: orderRef,
        // Locale par défaut (fr) faute de connaître celle de l'utilisateur à cet endroit —
        // PaymentResult (frontend) confirme le statut réel indépendamment du texte affiché ici.
        success_url: `${this.frontendUrl}/fr/commande/${orderRef}/confirmation`,
        error_url: `${this.frontendUrl}/fr/commande/${orderRef}/confirmation?status=failed`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Wave a refusé la création de session pour ${orderRef} (${response.status}): ${body}`);
      throw new ServiceUnavailableException('Le paiement Wave est momentanément indisponible. Réessayez.');
    }

    const data = (await response.json()) as WaveCheckoutSessionResponse;
    return data.wave_launch_url;
  }
}
