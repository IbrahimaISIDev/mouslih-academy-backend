import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { mapOrder } from './mappers/order.mapper.js';
import { WavePaymentProvider } from './payments/wave-payment.provider.js';

/** Délai simulé avant qu'une commande fraîchement créée soit confirmée par le stub Wave —
 *  même comportement que le mock frontend (features/checkout/api/get-order.ts), pour que la
 *  démo de bout en bout reste réaliste sans vraie passerelle de paiement. */
const AUTO_CONFIRM_AFTER_MS = 6_000;

const ORDER_INCLUDE = {
  items: true,
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1 },
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waveProvider: WavePaymentProvider,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ ref: string; waveCheckoutUrl: string }> {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, status: 'PUBLISHED' },
    });
    if (!course) {
      throw new NotFoundException('Formation introuvable');
    }

    if (dto.amountXof !== course.price) {
      throw new BadRequestException('Montant invalide');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (existingEnrollment?.status === 'ACTIVE') {
      throw new ConflictException('Formation déjà possédée');
    }

    const ref = generateOrderRef();
    const order = await this.prisma.order.create({
      data: {
        ref,
        userId,
        status: 'PENDING',
        totalAmount: course.price,
        items: { create: [{ courseId: course.id, unitPrice: course.price }] },
      },
    });

    const waveCheckoutUrl = await this.waveProvider.createCheckoutUrl({
      orderRef: order.ref,
      amountXof: course.price,
    });

    return { ref: order.ref, waveCheckoutUrl };
  }

  async getOrder(userId: string, ref: string) {
    const order = await this.prisma.order.findUnique({ where: { ref }, include: ORDER_INCLUDE });
    // Un ref qui existe mais appartient à quelqu'un d'autre est traité comme "introuvable" (pas
    // 403), pour ne pas laisser deviner l'existence d'une commande via son ref.
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Commande introuvable');
    }

    // Simulation démo uniquement (WaveStubProvider) : avec un vrai fournisseur, seul le webhook
    // Wave (voir confirmPaymentByRef) confirme un paiement — jamais un simple délai écoulé, ce
    // qui débloquerait une formation sans paiement réel.
    if (
      this.waveProvider.isSimulated &&
      order.status === 'PENDING' &&
      Date.now() - order.createdAt.getTime() > AUTO_CONFIRM_AFTER_MS
    ) {
      await this.confirmPayment(order.id, userId, order.items[0]!.courseId, order.ref, order.totalAmount);
      const updated = await this.prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: ORDER_INCLUDE });
      return mapOrder(updated);
    }

    return mapOrder(order);
  }

  /**
   * Point d'entrée du webhook Wave (voir WaveWebhookController) : confirme le paiement à partir
   * de la seule référence de commande, connue de Wave via client_reference. Idempotent — un
   * webhook rejoué (Wave retente en l'absence d'accusé 2xx) ne doit pas créer de doublon.
   */
  async confirmPaymentByRef(ref: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { ref }, include: ORDER_INCLUDE });
    if (!order) {
      this.logger.warn(`Webhook Wave reçu pour une référence de commande inconnue : ${ref}`);
      return;
    }
    if (order.status !== 'PENDING') return;

    await this.confirmPayment(order.id, order.userId, order.items[0]!.courseId, order.ref, order.totalAmount);
  }

  private async confirmPayment(
    orderId: string,
    userId: string,
    courseId: string,
    ref: string,
    amount: number,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
      this.prisma.payment.create({
        data: {
          orderId,
          transactionRef: `WAVE-${ref}`,
          amount,
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      }),
      this.prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { status: 'ACTIVE', orderId },
        create: { userId, courseId, orderId, status: 'ACTIVE' },
      }),
    ]);

    // Hors transaction volontairement : un échec/délai d'envoi ne doit jamais faire annuler ou
    // échouer une confirmation de paiement déjà actée en base.
    await this.sendAccessEmail(userId, courseId);
  }

  private async sendAccessEmail(userId: string, courseId: string): Promise<void> {
    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true, locale: true } }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        include: { translations: true },
      }),
    ]);
    if (!user || !course) return;

    const translation =
      course.translations.find((t) => t.locale === user.locale) ??
      course.translations.find((t) => t.locale === 'FR') ??
      course.translations[0];
    if (!translation) return;

    await this.emailService.sendCourseAccessEmail({
      to: user.email,
      firstName: user.firstName,
      courseName: translation.title,
      locale: user.locale,
    });
  }
}

function generateOrderRef(): string {
  const digits = 1_000_000 + Math.floor(Math.random() * 9_000_000);
  return `TX-${digits}`;
}
