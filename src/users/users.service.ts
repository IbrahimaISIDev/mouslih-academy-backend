import { Injectable, NotFoundException } from '@nestjs/common';
import { mapOrder } from '../orders/mappers/order.mapper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapProfile } from './mappers/profile.mapper.js';

/** Lundi 00:00 de la semaine en cours (heure serveur) — sert de borne pour "leçons terminées
 *  cette semaine" sur le tableau de bord apprenant. */
function startOfIsoWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const pendingRecitation = await this.prisma.recitation.findFirst({
      where: { userId, status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
      include: { lesson: { include: { submodule: { include: { module: true } } } } },
    });

    const lessonsCompletedThisWeek = await this.prisma.lessonProgress.count({
      where: { userId, status: 'COMPLETED', completedAt: { gte: startOfIsoWeek() } },
    });

    return mapProfile(user, pendingRecitation, lessonsCompletedThisWeek);
  }

  async getPurchaseHistory(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrder);
  }
}
