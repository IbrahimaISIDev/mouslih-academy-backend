export interface WaveCheckoutParams {
  orderRef: string;
  amountXof: number;
}

/**
 * Abstraction autour de l'intégration Wave : le jour où les identifiants marchand Wave sont
 * disponibles, seule l'implémentation (WaveStubProvider ci-dessous, ou une future
 * WaveApiProvider) change — OrdersService n'a pas à bouger.
 */
export abstract class WavePaymentProvider {
  abstract createCheckoutUrl(params: WaveCheckoutParams): Promise<string>;
}
