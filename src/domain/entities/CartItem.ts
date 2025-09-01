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

// CartItem Entity Class
export class CartItemEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: number,
    public readonly quantity: number,
    public readonly iva: boolean,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Validar cantidad
  static validateQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= 99;
  }

  // Calcular subtotal sin impuestos
  calculateSubtotal(productPrice: number): number {
    return this.quantity * productPrice;
  }

  // Calcular impuesto IVA (15%)
  calculateTax(productPrice: number): number {
    if (!this.iva) return 0;
    return this.calculateSubtotal(productPrice) * 0.15;
  }

  // Calcular total con impuestos
  calculateTotal(productPrice: number): number {
    return this.calculateSubtotal(productPrice) + this.calculateTax(productPrice);
  }

  // Aplicar descuento si el producto lo tiene
  calculateDiscountedPrice(originalPrice: number, discountPrice?: number): number {
    return discountPrice && discountPrice < originalPrice ? discountPrice : originalPrice;
  }

  // Actualizar cantidad
  updateQuantity(newQuantity: number): CartItemEntity {
    if (!CartItemEntity.validateQuantity(newQuantity)) {
      throw new Error('Cantidad debe estar entre 1 y 99');
    }
    
    return new CartItemEntity(
      this.id,
      this.userId,
      this.productId,
      newQuantity,
      this.iva,
      this.createdAt,
      new Date()
    );
  }

  // Verificar si puede agregar más cantidad
  canAddQuantity(additionalQuantity: number): boolean {
    return CartItemEntity.validateQuantity(this.quantity + additionalQuantity);
  }

  // Crear nuevo cart item
  static create(
    id: string,
    userId: string,
    productId: number,
    quantity: number,
    iva: boolean = true
  ): CartItemEntity {
    if (!CartItemEntity.validateQuantity(quantity)) {
      throw new Error('Cantidad debe estar entre 1 y 99');
    }

    return new CartItemEntity(id, userId, productId, quantity, iva);
  }
}

// CartSummary Entity Class
export class CartSummaryEntity {
  constructor(
    public readonly items: CartItemWithProduct[],
    public readonly subtotal: number,
    public readonly tax: number,
    public readonly total: number,
    public readonly itemCount: number
  ) {}

  // Crear resumen del carrito desde items
  static fromItems(items: CartItemWithProduct[]): CartSummaryEntity {
    const subtotal = items.reduce((sum, item) => {
      const cartItem = new CartItemEntity(
        item.id,
        item.userId,
        item.productId,
        item.quantity,
        item.iva,
        item.createdAt,
        item.updatedAt
      );
      const price = cartItem.calculateDiscountedPrice(item.product.price);
      return sum + cartItem.calculateSubtotal(price);
    }, 0);

    const tax = items.reduce((sum, item) => {
      const cartItem = new CartItemEntity(
        item.id,
        item.userId,
        item.productId,
        item.quantity,
        item.iva,
        item.createdAt,
        item.updatedAt
      );
      const price = cartItem.calculateDiscountedPrice(item.product.price);
      return sum + cartItem.calculateTax(price);
    }, 0);

    const total = subtotal + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return new CartSummaryEntity(items, subtotal, tax, total, itemCount);
  }

  // Verificar si el carrito está vacío
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Obtener último item agregado
  getLastItemAdded(): CartItemWithProduct | null {
    if (this.isEmpty()) return null;
    return this.items.reduce((latest, current) => 
      current.createdAt > latest.createdAt ? current : latest
    );
  }

  // Verificar si un producto ya está en el carrito
  hasProduct(productId: number): boolean {
    return this.items.some(item => item.productId === productId);
  }

  // Obtener item por productId
  getItemByProductId(productId: number): CartItemWithProduct | undefined {
    return this.items.find(item => item.productId === productId);
  }

  // Calcular peso total (si los productos tienen peso)
  calculateTotalWeight(): number {
    return this.items.reduce((weight, item) => {
      // Asumiendo que el producto tiene peso en gramos
      const productWeight = 100; // Placeholder - debería venir del producto
      return weight + (productWeight * item.quantity);
    }, 0);
  }
}
