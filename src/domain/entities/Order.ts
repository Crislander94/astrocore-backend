import { z } from 'zod';

// Enums
export const OrderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED', 
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const PaymentStatusEnum = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED'
]);

// Schema para item de orden
export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.number(),
  productName: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
});

// Schema para dirección de envío
export const shippingAddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().default('EC'),
  phone: z.string().optional(),
  instructions: z.string().optional(),
});

// Schema para orden
export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  status: OrderStatusEnum,
  paymentStatus: PaymentStatusEnum,
  paymentMethod: z.string().optional(),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  shippingAddress: shippingAddressSchema.optional(),
  items: z.array(orderItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para crear orden
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })).min(1, 'Order must have at least one item'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para actualizar estado de orden
export const updateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  notes: z.string().optional(),
});

// Schema para listado de órdenes
export const orderListSchema = z.object({
  orders: z.array(orderSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Schema para filtros de órdenes
export const orderFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: OrderStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(['orderNumber', 'total', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderList = z.infer<typeof orderListSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type PaymentStatusOrder = z.infer<typeof PaymentStatusEnum>;

// Order Entity Class
export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly userId: string,
    public readonly status: OrderStatus,
    public readonly paymentStatus: PaymentStatusOrder,
    public readonly items: OrderItem[],
    public readonly shippingAddress: ShippingAddress | null = null,
    public readonly paymentMethod: string | null = null,
    public readonly subtotal: number = 0,
    public readonly tax: number = 0,
    public readonly shipping: number = 0,
    public readonly discount: number = 0,
    public readonly total: number = 0,
    public readonly currency: string = 'USD',
    public readonly notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Calcular subtotal
  calculateSubtotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  // Calcular IVA (12% en Ecuador)
  calculateTax(): number {
    return this.calculateSubtotal() * 0.12;
  }

  // Calcular total
  calculateTotal(): number {
    return this.subtotal + this.tax + this.shipping - this.discount;
  }

  // Verificar si la orden puede ser cancelada
  canBeCancelled(): boolean {
    return ['PENDING', 'CONFIRMED'].includes(this.status);
  }

  // Verificar si la orden puede ser reembolsada
  canBeRefunded(): boolean {
    return ['DELIVERED'].includes(this.status) && this.paymentStatus === 'COMPLETED';
  }

  // Verificar si la orden está completada
  isCompleted(): boolean {
    return this.status === 'DELIVERED';
  }

  // Verificar si el pago está completado
  isPaymentCompleted(): boolean {
    return this.paymentStatus === 'COMPLETED';
  }

  // Obtener siguiente estado posible
  getNextPossibleStatuses(): OrderStatus[] {
    switch (this.status) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      case 'DELIVERED':
        return ['REFUNDED'];
      default:
        return [];
    }
  }

  // Actualizar estado
  updateStatus(newStatus: OrderStatus, notes?: string): OrderEntity {
    const possibleStatuses = this.getNextPossibleStatuses();
    
    if (!possibleStatuses.includes(newStatus)) {
      throw new Error(`Cannot change status from ${this.status} to ${newStatus}`);
    }

    return new OrderEntity(
      this.id,
      this.orderNumber,
      this.userId,
      newStatus,
      this.paymentStatus,
      this.items,
      this.shippingAddress,
      this.paymentMethod,
      this.subtotal,
      this.tax,
      this.shipping,
      this.discount,
      this.total,
      this.currency,
      notes || this.notes,
      this.createdAt,
      new Date()
    );
  }

  // Actualizar estado de pago
  updatePaymentStatus(newPaymentStatus: PaymentStatusOrder): OrderEntity {
    return new OrderEntity(
      this.id,
      this.orderNumber,
      this.userId,
      this.status,
      newPaymentStatus,
      this.items,
      this.shippingAddress,
      this.paymentMethod,
      this.subtotal,
      this.tax,
      this.shipping,
      this.discount,
      this.total,
      this.currency,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  // Generar número de orden único
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }
}
