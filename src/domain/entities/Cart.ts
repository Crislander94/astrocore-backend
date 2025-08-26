import { z } from 'zod';

// Schema que coincide exactamente con el frontend
const itemCartSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  oldPrice: z.number().optional(),
  haveDiscount: z.boolean().optional(),
  quantity: z.number(),
  iva: z.boolean(),
  images: z.array(z.string()).optional(),
});

export const itemsCartSchema = z.object({
  item: itemCartSchema,
  quantity: z.number(),
});

const cartSchema = z.object({
  items: z.array(itemCartSchema),
  lastItemAdded: z.union([itemCartSchema, z.null()]),
  total: z.number(),
  totalQuantity: z.number(),
});

// Schema para agregar item al carrito
export const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  iva: z.boolean().default(true),
});

// Schema para actualizar item del carrito
export const updateCartItemSchema = z.object({
  quantity: z.number().min(0),
});

// Types
export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof itemCartSchema>;
export type CartItems = z.infer<typeof itemsCartSchema>;
export type AddToCartDto = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

// Cart Entity Class
export class CartEntity {
  constructor(
    public readonly userId: string,
    public readonly items: CartItem[] = [],
    public readonly lastItemAdded: CartItem | null = null
  ) {}

  // Calcular total del carrito
  getTotal(): number {
    return this.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      // Aplicar IVA si corresponde (12% en Ecuador)
      return total + (item.iva ? itemTotal * 1.12 : itemTotal);
    }, 0);
  }

  // Calcular cantidad total de items
  getTotalQuantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Calcular subtotal sin IVA
  getSubtotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Calcular total de IVA
  getTotalIva(): number {
    return this.items.reduce((total, item) => {
      if (item.iva) {
        return total + (item.price * item.quantity * 0.12);
      }
      return total;
    }, 0);
  }

  // Verificar si el carrito está vacío
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Buscar item por ID de producto
  findItemByProductId(productId: number): CartItem | undefined {
    return this.items.find(item => item.id === productId);
  }

  // Convertir a formato frontend
  toFrontend(): Cart {
    return {
      items: this.items,
      lastItemAdded: this.lastItemAdded,
      total: this.getTotal(),
      totalQuantity: this.getTotalQuantity(),
    };
  }

  // Agregar item al carrito
  addItem(item: CartItem): CartEntity {
    const existingItemIndex = this.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Si el item ya existe, actualizar cantidad
      const updatedItems = [...this.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex]!,
        quantity: updatedItems[existingItemIndex]!.quantity + item.quantity,
      };
      
      return new CartEntity(this.userId, updatedItems, item);
    } else {
      // Si es un item nuevo, agregarlo
      return new CartEntity(this.userId, [...this.items, item], item);
    }
  }

  // Actualizar cantidad de un item
  updateItemQuantity(productId: number, quantity: number): CartEntity {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const updatedItems = this.items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );

    return new CartEntity(this.userId, updatedItems, this.lastItemAdded);
  }

  // Remover item del carrito
  removeItem(productId: number): CartEntity {
    const updatedItems = this.items.filter(item => item.id !== productId);
    return new CartEntity(this.userId, updatedItems, this.lastItemAdded);
  }

  // Limpiar carrito
  clear(): CartEntity {
    return new CartEntity(this.userId, [], null);
  }
}
