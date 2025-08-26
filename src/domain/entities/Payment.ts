import { z } from 'zod';

// Schema para pago
export const paymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  transactionId: z.string().optional(),
  datafastReference: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']),
  method: z.string().default('datafast'),
  gateway: z.string().default('datafast'),
  gatewayResponse: z.record(z.any()).optional(),
  failureReason: z.string().optional(),
  processedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para crear pago con Datafast
export const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// Schema para callback de Datafast
export const datafastCallbackSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.string(),
  currency: z.string(),
  reference: z.string(),
  authorization: z.string().optional(),
  card_type: z.string().optional(),
  card_number: z.string().optional(),
  response_code: z.string(),
  response_text: z.string(),
  transaction_date: z.string(),
  signature: z.string(),
});

// Schema para respuesta de creación de pago
export const paymentResponseSchema = z.object({
  paymentId: z.string(),
  paymentUrl: z.string(),
  transactionId: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
});

// Schema para verificar estado de pago
export const paymentStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  transactionId: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  processedAt: z.date().optional(),
  failureReason: z.string().optional(),
});

// Types
export type Payment = z.infer<typeof paymentSchema>;
export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type DatafastCallback = z.infer<typeof datafastCallbackSchema>;
export type PaymentResponse = z.infer<typeof paymentResponseSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Payment Entity Class
export class PaymentEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string = 'USD',
    public readonly status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' = 'PENDING',
    public readonly method: string = 'datafast',
    public readonly gateway: string = 'datafast',
    public readonly transactionId?: string,
    public readonly datafastReference?: string,
    public readonly gatewayResponse?: Record<string, any>,
    public readonly failureReason?: string,
    public readonly processedAt?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Verificar si el pago está pendiente
  isPending(): boolean {
    return this.status === 'PENDING';
  }

  // Verificar si el pago está procesando
  isProcessing(): boolean {
    return this.status === 'PROCESSING';
  }

  // Verificar si el pago está completado
  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  // Verificar si el pago falló
  isFailed(): boolean {
    return this.status === 'FAILED';
  }

  // Verificar si el pago fue cancelado
  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  // Verificar si el pago fue reembolsado
  isRefunded(): boolean {
    return this.status === 'REFUNDED';
  }

  // Verificar si el pago puede ser reembolsado
  canBeRefunded(): boolean {
    return this.status === 'COMPLETED';
  }

  // Marcar como completado
  markAsCompleted(transactionId: string, datafastReference?: string, gatewayResponse?: Record<string, any>): PaymentEntity {
    return new PaymentEntity(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      'COMPLETED',
      this.method,
      this.gateway,
      transactionId,
      datafastReference,
      gatewayResponse,
      undefined,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  // Marcar como fallido
  markAsFailed(failureReason: string, gatewayResponse?: Record<string, any>): PaymentEntity {
    return new PaymentEntity(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      'FAILED',
      this.method,
      this.gateway,
      this.transactionId,
      this.datafastReference,
      gatewayResponse,
      failureReason,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  // Marcar como procesando
  markAsProcessing(transactionId?: string): PaymentEntity {
    return new PaymentEntity(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      'PROCESSING',
      this.method,
      this.gateway,
      transactionId || this.transactionId,
      this.datafastReference,
      this.gatewayResponse,
      this.failureReason,
      this.processedAt,
      this.createdAt,
      new Date()
    );
  }

  // Marcar como cancelado
  markAsCancelled(): PaymentEntity {
    return new PaymentEntity(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      'CANCELLED',
      this.method,
      this.gateway,
      this.transactionId,
      this.datafastReference,
      this.gatewayResponse,
      'Payment cancelled by user',
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  // Marcar como reembolsado
  markAsRefunded(gatewayResponse?: Record<string, any>): PaymentEntity {
    if (!this.canBeRefunded()) {
      throw new Error('Payment cannot be refunded');
    }

    return new PaymentEntity(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      'REFUNDED',
      this.method,
      this.gateway,
      this.transactionId,
      this.datafastReference,
      gatewayResponse,
      this.failureReason,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  // Convertir a respuesta de estado
  toStatusResponse(): PaymentStatus {
    return {
      id: this.id,
      status: this.status,
      transactionId: this.transactionId,
      amount: this.amount,
      currency: this.currency,
      processedAt: this.processedAt,
      failureReason: this.failureReason,
    };
  }

  // Obtener mensaje de estado amigable
  getStatusMessage(): string {
    switch (this.status) {
      case 'PENDING':
        return 'Pago pendiente de procesamiento';
      case 'PROCESSING':
        return 'Pago en proceso';
      case 'COMPLETED':
        return 'Pago completado exitosamente';
      case 'FAILED':
        return `Pago fallido: ${this.failureReason || 'Error desconocido'}`;
      case 'CANCELLED':
        return 'Pago cancelado';
      case 'REFUNDED':
        return 'Pago reembolsado';
      default:
        return 'Estado desconocido';
    }
  }
}
