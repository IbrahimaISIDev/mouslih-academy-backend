import { Injectable } from '@nestjs/common';
import { parseDurationToMs } from '../common/duration.js';
import type { OrderStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { GetRecentPaymentsQuery } from './dto/get-recent-payments.query.js';
import type { ListAdminOrdersQuery } from './dto/list-admin-orders.query.js';
import type { ListAdminUsersQuery } from './dto/list-admin-users.query.js';
import { mapAdminOrderRow } from './mappers/admin-order-row.mapper.js';
import { getInitials } from './mappers/get-initials.js';

const PAGE_SIZE = 7;
const RECENT_PAYMENTS_COUNT = 6;
const RECENT_SIGNUPS_COUNT = 5;

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(range: string) {
    const windowMs = parseDurationToMs(range, 30 * 86_400_000);
    const now = new Date();
    const currentStart = new Date(now.getTime() - windowMs);
    const previousStart = new Date(currentStart.getTime() - windowMs);

    const [currentOrders, previousOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: { status: 'PAID', createdAt: { gte: currentStart, lte: now } },
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: { status: 'PAID', createdAt: { gte: previousStart, lt: currentStart } },
        select: { totalAmount: true },
      }),
    ]);

    const revenueXof = sum(currentOrders.map((o) => o.totalAmount));
    const previousRevenue = sum(previousOrders.map((o) => o.totalAmount));
    const revenueChangeXof = revenueXof - previousRevenue;
    const revenueChangePct =
      previousRevenue > 0
        ? Math.round((revenueChangeXof / previousRevenue) * 100)
        : revenueXof > 0
          ? 100
          : 0;

    const salesCount = currentOrders.length;
    const salesChange = salesCount - previousOrders.length;

    const [learnersCount, currentLearners, previousLearners] = await Promise.all([
      this.prisma.user.count({ where: { role: 'LEARNER' } }),
      this.prisma.user.count({ where: { role: 'LEARNER', createdAt: { gte: currentStart, lte: now } } }),
      this.prisma.user.count({
        where: { role: 'LEARNER', createdAt: { gte: previousStart, lt: currentStart } },
      }),
    ]);
    const learnersChange = currentLearners - previousLearners;

    const [currentEnrollments, previousEnrollments] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { status: 'ACTIVE', createdAt: { gte: currentStart, lte: now } },
        select: { completedAt: true },
      }),
      this.prisma.enrollment.findMany({
        where: { status: 'ACTIVE', createdAt: { gte: previousStart, lt: currentStart } },
        select: { completedAt: true },
      }),
    ]);
    const completionRatePct = completionRateOf(currentEnrollments);
    const completionRateChangePts = Math.round(completionRatePct - completionRateOf(previousEnrollments));

    const salesByCourseRaw = await this.prisma.orderItem.groupBy({
      by: ['courseId'],
      where: { order: { status: 'PAID' } },
      _count: { _all: true },
      _sum: { unitPrice: true },
    });
    const salesByCourse = salesByCourseRaw
      .map((row) => ({
        courseId: row.courseId,
        sales: row._count._all,
        revenueXof: row._sum.unitPrice ?? 0,
      }))
      .sort((a, b) => b.sales - a.sales);

    const [recitationsToReview, oldestRecitation, unansweredQuestions, totalOrdersCount] = await Promise.all([
      this.prisma.recitation.count({ where: { status: 'PENDING' } }),
      this.prisma.recitation.findFirst({ where: { status: 'PENDING' }, orderBy: { submittedAt: 'asc' } }),
      this.prisma.lessonQuestion.count({ where: { answer: null } }),
      this.prisma.order.count(),
    ]);
    const oldestRecitationDaysAgo = oldestRecitation
      ? Math.floor((Date.now() - oldestRecitation.submittedAt.getTime()) / 86_400_000)
      : 0;

    return {
      kpi: {
        revenueXof,
        revenueChangePct,
        revenueChangeXof,
        salesCount,
        salesChange,
        learnersCount,
        learnersChange,
        completionRatePct,
        completionRateChangePts,
      },
      salesByCourse,
      queue: { recitationsToReview, oldestRecitationDaysAgo, unansweredQuestions },
      totalOrdersCount,
    };
  }

  async listOrders(query: ListAdminOrdersQuery) {
    const localeEnum = query.locale.toUpperCase() as 'FR' | 'EN' | 'AR';
    const statusFilter = statusToEnums(query.status);

    const orders = await this.prisma.order.findMany({
      where: statusFilter ? { status: { in: statusFilter } } : {},
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: {
          include: { course: { include: { translations: { where: { locale: localeEnum } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = orders.map((order) =>
      mapAdminOrderRow({
        ref: order.ref,
        amountXof: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        learnerName: `${order.user.firstName} ${order.user.lastName}`,
        courseTitle: order.items[0]?.course.translations[0]?.title ?? '',
      }),
    );

    const query_ = query.q?.trim().toLowerCase();
    const filtered = query_
      ? rows.filter(
          (row) =>
            row.ref.toLowerCase().includes(query_) ||
            row.learnerName.toLowerCase().includes(query_) ||
            row.courseTitle.toLowerCase().includes(query_),
        )
      : rows;

    const start = (query.page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      page: query.page,
      pageSize: PAGE_SIZE,
      total: filtered.length,
    };
  }

  async recentPayments(query: GetRecentPaymentsQuery) {
    const localeEnum = query.locale.toUpperCase() as 'FR' | 'EN' | 'AR';

    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: {
          include: { course: { include: { translations: { where: { locale: localeEnum } } } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: RECENT_PAYMENTS_COUNT,
    });

    return orders.map((order) =>
      mapAdminOrderRow({
        ref: order.ref,
        amountXof: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        learnerName: `${order.user.firstName} ${order.user.lastName}`,
        courseTitle: order.items[0]?.course.translations[0]?.title ?? '',
      }),
    );
  }

  async listUsers(query: ListAdminUsersQuery) {
    const users = await this.prisma.user.findMany({
      where: { role: 'LEARNER' },
      include: { _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      city: user.city ?? '',
      email: user.email,
      phone: user.phone ?? '',
      coursesCount: user._count.enrollments,
      joinedAt: user.createdAt.toISOString(),
    }));

    const filteredByPurchase = rows.filter((row) => {
      if (query.filter === 'withPurchase') return row.coursesCount > 0;
      if (query.filter === 'withoutPurchase') return row.coursesCount === 0;
      return true;
    });

    const q = query.q?.trim().toLowerCase();
    const filtered = q
      ? filteredByPurchase.filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            row.email.toLowerCase().includes(q) ||
            row.phone.toLowerCase().includes(q),
        )
      : filteredByPurchase;

    const start = (query.page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      page: query.page,
      pageSize: PAGE_SIZE,
      total: filtered.length,
    };
  }

  async recentSignups() {
    const users = await this.prisma.user.findMany({
      where: { role: 'LEARNER' },
      orderBy: { createdAt: 'desc' },
      take: RECENT_SIGNUPS_COUNT,
    });

    const now = Date.now();
    return users.map((user) => {
      const name = `${user.firstName} ${user.lastName}`;
      const ageMs = now - user.createdAt.getTime();
      const ageHours = ageMs / (60 * 60 * 1000);

      let recency: { hoursAgo: number } | { yesterday: true } | Record<string, never> = {};
      if (ageHours < 24) {
        recency = { hoursAgo: Math.max(1, Math.round(ageHours)) };
      } else if (ageHours < 48) {
        recency = { yesterday: true };
      }

      return {
        id: user.id,
        name,
        initials: getInitials(name),
        city: user.city ?? '',
        ...recency,
      };
    });
  }
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function completionRateOf(enrollments: { completedAt: Date | null }[]): number {
  if (enrollments.length === 0) return 0;
  const completed = enrollments.filter((e) => e.completedAt !== null).length;
  return Math.round((completed / enrollments.length) * 100);
}

function statusToEnums(status: 'all' | 'paid' | 'pending' | 'failed'): OrderStatus[] | undefined {
  switch (status) {
    case 'paid':
      return ['PAID'];
    case 'pending':
      return ['PENDING'];
    case 'failed':
      return ['FAILED', 'CANCELLED'];
    default:
      return undefined;
  }
}
