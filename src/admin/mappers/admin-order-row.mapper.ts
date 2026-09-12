import type { OrderStatus } from '../../generated/prisma/enums.js';
import { getInitials } from './get-initials.js';

const STATUS_TO_FRONTEND: Record<OrderStatus, 'paid' | 'pending' | 'failed' | 'refunded'> = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'failed',
  REFUNDED: 'refunded',
};

interface AdminOrderRowInput {
  ref: string;
  amountXof: number;
  status: OrderStatus;
  createdAt: Date;
  learnerName: string;
  courseTitle: string;
}

export function mapAdminOrderRow(row: AdminOrderRowInput) {
  return {
    ref: row.ref,
    learnerName: row.learnerName,
    learnerInitials: getInitials(row.learnerName),
    courseTitle: row.courseTitle,
    amountXof: row.amountXof,
    status: STATUS_TO_FRONTEND[row.status],
    createdAt: row.createdAt.toISOString(),
  };
}
