import { VerificationCodeType } from '@/domain/entities/VerificationCode.js';

export interface EmailService {
  // Enviar código de verificación
  sendVerificationCode(
    email: string,
    userName: string,
    code: string,
    type: VerificationCodeType
  ): Promise<void>;

  // Enviar email de bienvenida
  sendWelcomeEmail(email: string, userName: string): Promise<void>;

  // Enviar notificación de orden
  sendOrderConfirmation(
    email: string,
    userName: string,
    orderNumber: string,
    orderDetails: any
  ): Promise<void>;

  // Enviar notificación de pago
  sendPaymentConfirmation(
    email: string,
    userName: string,
    paymentDetails: any
  ): Promise<void>;

  // Verificar configuración del servicio
  isConfigured(): boolean;
}
