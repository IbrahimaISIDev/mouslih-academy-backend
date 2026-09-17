export interface WaveCheckoutParams {
  orderRef: string;
  amountXof: number;
}

/**
 * Abstraction autour de l'intégration Wave : le jour où les identifiants marchand Wave sont
 * disponibles, seule l'implémentation change (WaveStubProvider ↔ WaveApiProvider, sélection
 * automatique dans OrdersModule selon la présence de WAVE_API_KEY) — OrdersService n'a pas
 * à bouger.
 */
export abstract class WavePaymentProvider {
  /** true pour le stub : désactive la confirmation automatique après délai dans OrdersService,
   *  un comportement de démo qui deviendrait une faille de sécurité avec un vrai fournisseur
   *  (formation débloquée sans paiement réel). */
  abstract readonly isSimulated: boolean;

  abstract createCheckoutUrl(params: WaveCheckoutParams): Promise<string>;
}
