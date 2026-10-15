import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly appUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = Boolean(this.config.get('MAIL_HOST'));
    this.from = this.config.get('MAIL_FROM') ?? 'no-reply@swiftly.local';
    this.appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';

    this.transporter = this.enabled
      ? createTransport({
          host: this.config.get('MAIL_HOST'),
          port: Number(this.config.get('MAIL_PORT') ?? 587),
          secure: Number(this.config.get('MAIL_PORT') ?? 587) === 465,
          auth: {
            user: this.config.get('MAIL_USER'),
            pass: this.config.get('MAIL_PASSWORD'),
          },
        })
      : null;
  }

  async sendActivationEmail(email: string, token: string): Promise<void> {
    const link = `${this.appUrl}/activate/${token}`;
    await this.send(
      email,
      'Activate your account',
      `<p>Welcome to Swiftly.</p><p>Activate your account:</p><p><a href="${link}">${link}</a></p>`,
    );
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    await this.send(
      email,
      'Reset your password',
      `<p>Use the link below to reset your password:</p><p><a href="${link}">${link}</a></p><p>This link is valid once.</p>`,
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
    await this.send(
      email,
      `Your order is now ${status}`,
      `<p>Order status changed to <b>${status}</b>.</p>${tracking}`,
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `MAIL_HOST is not set. Email skipped: "${subject}" -> ${to}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (error) {
      this.logger.error(
        `Failed to send "${subject}" to ${to}: ${(error as Error).message}`,
      );
    }
  }
}
