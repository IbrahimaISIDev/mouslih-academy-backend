import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

export interface CourseAccessEmailParams {
  to: string;
  firstName: string;
  courseName: string;
  locale: 'FR' | 'EN' | 'AR';
}

const FRONTEND_URL = (process.env['FRONTEND_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');

const COPY: Record<
  CourseAccessEmailParams['locale'],
  { subject: (course: string) => string; html: (p: CourseAccessEmailParams, url: string) => string; text: (p: CourseAccessEmailParams, url: string) => string }
> = {
  FR: {
    subject: (course) => `Votre accès à « ${course} » est prêt`,
    html: (p, url) => `
      <p>Salam ${p.firstName},</p>
      <p>Votre paiement pour <strong>${p.courseName}</strong> a été confirmé. Vous avez désormais un accès à vie à cette formation.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#38b349;color:#0b230e;text-decoration:none;border-radius:4px;font-weight:600">Accéder à ma formation</a></p>
      <p>Connectez-vous avec l'adresse e-mail et le mot de passe que vous avez choisis à l'inscription.</p>
      <p>Une question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp.</p>
      <p>Mouslih Academy</p>
    `,
    text: (p, url) =>
      `Salam ${p.firstName},\n\nVotre paiement pour "${p.courseName}" a été confirmé. Accédez à votre formation : ${url}\n\nConnectez-vous avec l'adresse e-mail et le mot de passe choisis à l'inscription.\n\nMouslih Academy`,
  },
  EN: {
    subject: (course) => `Your access to "${course}" is ready`,
    html: (p, url) => `
      <p>Salam ${p.firstName},</p>
      <p>Your payment for <strong>${p.courseName}</strong> has been confirmed. You now have lifetime access to this course.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#38b349;color:#0b230e;text-decoration:none;border-radius:4px;font-weight:600">Access my course</a></p>
      <p>Log in with the email and password you chose when signing up.</p>
      <p>Any question? Reply to this email or write to us on WhatsApp.</p>
      <p>Mouslih Academy</p>
    `,
    text: (p, url) =>
      `Salam ${p.firstName},\n\nYour payment for "${p.courseName}" has been confirmed. Access your course: ${url}\n\nLog in with the email and password you chose when signing up.\n\nMouslih Academy`,
  },
  AR: {
    subject: (course) => `وصولك إلى «${course}» جاهز الآن`,
    html: (p, url) => `
      <p dir="rtl">السلام عليكم ${p.firstName}،</p>
      <p dir="rtl">تم تأكيد دفعتك لـ <strong>${p.courseName}</strong>. أصبح لديك الآن وصول مدى الحياة إلى هذه الدورة.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#38b349;color:#0b230e;text-decoration:none;border-radius:4px;font-weight:600">الوصول إلى دورتي</a></p>
      <p dir="rtl">سجّل الدخول بالبريد الإلكتروني وكلمة المرور اللذين اخترتهما عند التسجيل.</p>
      <p dir="rtl">أكاديمية مصلح</p>
    `,
    text: (p, url) =>
      `السلام عليكم ${p.firstName}،\n\nتم تأكيد دفعتك لـ "${p.courseName}". الوصول إلى دورتك: ${url}\n\nسجّل الدخول بالبريد الإلكتروني وكلمة المرور اللذين اخترتهما عند التسجيل.\n\nأكاديمية مصلح`,
  },
};

/**
 * L'envoi ne doit jamais faire échouer la confirmation de paiement elle-même : la commande est
 * déjà marquée payée et l'inscription déjà active au moment où ce service est appelé (voir
 * OrdersService.confirmPayment) — un e-mail non livré est dégradé en avertissement, pas une
 * erreur qui remonterait jusqu'au webhook Wave ou casserait la page de confirmation.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly from = process.env['SMTP_FROM'] ?? 'Mouslih Academy <no-reply@mouslihacademy.sn>';

  constructor() {
    const host = process.env['SMTP_HOST'];
    const port = process.env['SMTP_PORT'];
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASSWORD'];

    this.transporter =
      host && port && user && pass
        ? nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass },
          })
        : null;
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendCourseAccessEmail(params: CourseAccessEmailParams): Promise<void> {
    const copy = COPY[params.locale] ?? COPY.FR;
    const courseUrl = `${FRONTEND_URL}/${params.locale.toLowerCase()}/tableau-de-bord`;
    const subject = copy.subject(params.courseName);

    if (!this.transporter) {
      this.logger.warn(
        `SMTP non configuré — e-mail "${subject}" pour ${params.to} non envoyé (voir SMTP_* dans .env.example).`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject,
        html: copy.html(params, courseUrl),
        text: copy.text(params, courseUrl),
      });
    } catch (error) {
      // Volontairement avalé : voir la note de classe ci-dessus.
      this.logger.error(`Échec d'envoi de l'e-mail de confirmation à ${params.to}`, error);
    }
  }
}
