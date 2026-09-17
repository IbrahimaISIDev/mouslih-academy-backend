import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Vérifie la signature d'un webhook Wave. Écrit sur le schéma documenté le plus courant pour ce
 * type d'API (même famille que Stripe : en-tête "t=<timestamp>,v1=<hmac>", HMAC-SHA256 du couple
 * "<timestamp>.<corps brut>" avec le secret de webhook) — le nom exact de l'en-tête et le format
 * doivent être confirmés contre https://docs.wave.com/business/webhooks au premier vrai test,
 * jamais vérifiés en pratique faute d'un compte marchand réel.
 */
export const WAVE_SIGNATURE_HEADER = 'wave-signature';

export function verifyWaveSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );
  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const signatureBuffer = Buffer.from(signature, 'hex');
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}
