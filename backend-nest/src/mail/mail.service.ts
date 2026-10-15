import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resendKey: string | null;
  private readonly smtp: Transporter | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    // Resend має пріоритет: Render на безкоштовних інстансах блокує
    // вихідні SMTP-порти (25/465/587), тому звичайний SMTP там не працює.
    // Resend — це звичайний HTTPS-запит, він проходить.
    this.resendKey = this.config.get<string>('RESEND_API_KEY') || null;

    const host = this.config.get<string>('MAIL_HOST');
    const port = Number(this.config.get('MAIL_PORT') ?? 587);
    this.smtp = host
      ? createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user: this.config.get<string>('MAIL_USER'),
            pass: this.config.get<string>('MAIL_PASSWORD'),
          },
        })
      : null;

    this.from =
      this.config.get<string>('MAIL_FROM') ??
      this.config.get<string>('RESEND_FROM') ??
      'no-reply@swiftly.local';
    this.appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';

    this.logger.log(
      this.resendKey
        ? 'mail transport: Resend (HTTPS API)'
        : this.smtp
          ? `mail transport: SMTP ${host}:${port}`
          : 'mail transport: вимкнено — посилання активації підуть у лог',
    );
  }

  async sendActivationEmail(email: string, token: string): Promise<void> {
    const link = `${this.appUrl}/activate/${token}`;
    await this.deliver(
      email,
      'Activate your account',
      `<p>Welcome to Swiftly.</p><p>Activate your account:</p><p><a href="${link}">${link}</a></p>`,
      link,
    );
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    await this.deliver(
      email,
      'Reset your password',
      `<p>Use the link below to reset your password:</p><p><a href="${link}">${link}</a></p><p>This link is valid once.</p>`,
      link,
    );
  }

  async sendOrderStatusEmail(
    email: string,
    status: string,
    trackingNumber?: string | null,
  ): Promise<void> {
    const tracking = trackingNumber
      ? `<p>Tracking number: ${trackingNumber}</p>`
      : '';
    await this.deliver(
      email,
      `Your order is now ${status}`,
      `<p>Order status changed to <b>${status}</b>.</p>${tracking}`,
    );
  }

  private async deliver(
    to: string,
    subject: string,
    html: string,
    link?: string,
  ): Promise<void> {
    let delivered = false;

    try {
      if (this.resendKey) {
        await this.sendViaResend(to, subject, html);
        delivered = true;
      } else if (this.smtp) {
        await this.smtp.sendMail({ from: this.from, to, subject, html });
        delivered = true;
      } else {
        this.logger.warn(
          `RESEND_API_KEY і MAIL_HOST не задані. Лист пропущено: "${subject}" -> ${to}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Не вдалося надіслати "${subject}" на ${to}: ${(error as Error).message}`,
      );
    }

    // Акаунт без листа не активувати — користувач залишиться
    // заблокованим назавжди. Тому посилання дублюється в лог
    // щоразу, коли лист не дійшов.
    if (!delivered && link) {
      this.logger.warn(`Посилання для ручної активації: ${link}`);
    }
  }

  private async sendViaResend(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend ${response.status}: ${await response.text()}`);
    }
  }
}