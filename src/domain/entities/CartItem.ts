import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.number(),
  quantity: z.number(),
  iva: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartItemWithProductSchema = CartItemSchema.extend({
  product: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    images: z.array(z.string()),
    isActive: z.boolean(),
    quantity: z.number(),
  }),
});

export const CartSummarySchema = z.object({
  items: z.array(CartItemWithProductSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  itemCount: z.number(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartItemWithProduct = z.infer<typeof CartItemWithProductSchema>;
export type CartSummary = z.infer<typeof CartSummarySchema>;
