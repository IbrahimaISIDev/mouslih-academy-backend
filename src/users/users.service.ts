import { Injectable, NotFoundException } from '@nestjs/common';
import { mapOrder } from '../orders/mappers/order.mapper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { mapProfile } from './mappers/profile.mapper.js';

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

    return mapProfile(user, pendingRecitation);
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
