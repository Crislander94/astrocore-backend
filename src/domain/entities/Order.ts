import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const PaymentStatusOrderSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED'
]);

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusOrderSchema,
  paymentMethod: z.string().nullable(),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  currency: z.string(),
  notes: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.number(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
});

export const OrderItemWithProductSchema = OrderItemSchema.extend({
  product: z.object({
    id: z.number(),
    name: z.string(),
    images: z.array(z.string()).nullable(),
  }),
});

export const OrderWithDetailsSchema = OrderSchema.extend({
  items: z.array(OrderItemWithProductSchema),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    phone: z.string().nullable(),
  }).nullable(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatusOrder = z.infer<typeof PaymentStatusOrderSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderItemWithProduct = z.infer<typeof OrderItemWithProductSchema>;
export type OrderWithDetails = z.infer<typeof OrderWithDetailsSchema>;
