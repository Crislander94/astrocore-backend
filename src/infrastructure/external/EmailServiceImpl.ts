import nodemailer from 'nodemailer';
import { EmailService } from '@/application/ports/EmailService.js';
import { VerificationCodeType } from '@/domain/entities/VerificationCode.js';
import { config } from '@/infrastructure/config/environment.js';
import { logger } from '@/shared/utils/logger.js';

export class EmailServiceImpl implements EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (!this.isConfigured()) {
      logger.warn('Email service not configured. Email functionality will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendVerificationCode(
    email: string,
    userName: string,
    code: string,
    type: VerificationCodeType
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Email not sent to ${email} - service not configured`);
      return;
    }

    const subject = this.getSubjectByType(type);
    const html = this.getVerificationEmailTemplate(userName, code, type);

    try {
      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.fromEmail}>`,
        to: email,
        subject,
        html,
      });

      logger.info(`Verification email sent to ${email} for ${type}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Welcome email not sent to ${email} - service not configured`);
      return;
    }

    const html = this.getWelcomeEmailTemplate(userName);

    try {
      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.fromEmail}>`,
        to: email,
        subject: '¡Bienvenido a AstroCore!',
        html,
      });

      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  async sendOrderConfirmation(
    email: string,
    userName: string,
    orderNumber: string,
    orderDetails: any
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Order confirmation not sent to ${email} - service not configured`);
      return;
    }

    const html = this.getOrderConfirmationTemplate(userName, orderNumber, orderDetails);

    try {
      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.fromEmail}>`,
        to: email,
        subject: `Confirmación de Orden #${orderNumber}`,
        html,
      });

      logger.info(`Order confirmation sent to ${email} for order ${orderNumber}`);
    } catch (error) {
      logger.error(`Failed to send order confirmation to ${email}:`, error);
    }
  }

  async sendPaymentConfirmation(
    email: string,
    userName: string,
    paymentDetails: any
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn(`Payment confirmation not sent to ${email} - service not configured`);
      return;
    }

    const html = this.getPaymentConfirmationTemplate(userName, paymentDetails);

    try {
      await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.fromEmail}>`,
        to: email,
        subject: 'Confirmación de Pago - AstroCore',
        html,
      });

      logger.info(`Payment confirmation sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send payment confirmation to ${email}:`, error);
    }
  }

  isConfigured(): boolean {
    return !!(
      config.email.host &&
      config.email.user &&
      config.email.pass &&
      config.email.fromEmail
    );
  }

  private getSubjectByType(type: VerificationCodeType): string {
    switch (type) {
      case 'LOGIN':
        return 'Código de inicio de sesión - AstroCore';
      case 'REGISTER':
        return 'Verifica tu cuenta - AstroCore';
      case 'PASSWORD_RESET':
        return 'Recuperación de contraseña - AstroCore';
      default:
        return 'Código de verificación - AstroCore';
    }
  }

  private getVerificationEmailTemplate(
    userName: string,
    code: string,
    type: VerificationCodeType
  ): string {
    const message = this.getMessageByType(type);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Código de Verificación</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .code { font-size: 32px; font-weight: bold; text-align: center; 
                  background: white; padding: 20px; margin: 20px 0; 
                  border: 2px dashed #2563eb; letter-spacing: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AstroCore</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>${message}</p>
            <div class="code">${code}</div>
            <p><strong>Este código expira en 10 minutos.</strong></p>
            <p>Si no solicitaste este código, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AstroCore. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a AstroCore!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>¡Bienvenido a AstroCore!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hola ${userName},</h2>
            <p>¡Gracias por unirte a AstroCore! Tu cuenta ha sido verificada exitosamente.</p>
            <p>Ahora puedes disfrutar de todas nuestras funcionalidades:</p>
            <ul>
              <li>Explorar nuestro catálogo de productos</li>
              <li>Realizar compras seguras</li>
              <li>Seguimiento de tus órdenes</li>
              <li>Y mucho más...</li>
            </ul>
            <p>¡Esperamos que tengas una excelente experiencia!</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>© 2024 AstroCore. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(userName: string, orderNumber: string, orderDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Orden</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Orden Confirmada</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hola ${userName},</h2>
            <p>Tu orden <strong>#${orderNumber}</strong> ha sido confirmada exitosamente.</p>
            <p>Te notificaremos cuando tu orden sea enviada.</p>
            <p>Gracias por tu compra en AstroCore.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentConfirmationTemplate(userName: string, paymentDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pago Confirmado</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Pago Confirmado</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hola ${userName},</h2>
            <p>Tu pago ha sido procesado exitosamente.</p>
            <p>Gracias por tu compra en AstroCore.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getMessageByType(type: VerificationCodeType): string {
    switch (type) {
      case 'LOGIN':
        return 'Usa el siguiente código para iniciar sesión en tu cuenta:';
      case 'REGISTER':
        return 'Usa el siguiente código para verificar tu cuenta:';
      case 'PASSWORD_RESET':
        return 'Usa el siguiente código para restablecer tu contraseña:';
      default:
        return 'Usa el siguiente código de verificación:';
    }
  }
}
