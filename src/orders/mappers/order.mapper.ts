import type { OrderStatus } from '../../generated/prisma/enums.js';

const STATUS_TO_FRONTEND: Record<OrderStatus, 'paid' | 'pending' | 'failed' | 'refunded'> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  // Pas d'équivalent "cancelled" côté frontend (OrderStatus n'a que 4 valeurs) : le plus proche
  // sémantiquement est "failed" (la commande ne s'est pas conclue).
  CANCELLED: 'failed',
  REFUNDED: 'refunded',
};

interface OrderRow {
  ref: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  items: { courseId: string }[];
  payments: { transactionRef: string }[];
}

export function mapOrder(order: OrderRow) {
  return {
    ref: order.ref,
    userId: order.userId,
    courseId: order.items[0]?.courseId ?? '',
    amountXof: order.totalAmount,
    status: STATUS_TO_FRONTEND[order.status],
    createdAt: order.createdAt.toISOString(),
    waveTransactionId: order.payments[0]?.transactionRef,
  };
}
