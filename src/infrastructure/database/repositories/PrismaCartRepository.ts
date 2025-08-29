import { PrismaClient } from '@prisma/client';
import { CartRepository } from '../../../domain/repositories/CartRepository';
import { CartItem, CartItemWithProduct } from '../../../domain/entities/CartItem';

export class PrismaCartRepository implements CartRepository {
  constructor(private prisma: PrismaClient) {}

  async addItem(userId: string, productId: number, quantity: number, iva: boolean = true): Promise<CartItem> {
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existingItem) {
      return await this.prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existingItem.quantity + quantity }
      });
    }

    return await this.prisma.cartItem.create({
      data: { userId, productId, quantity, iva }
    });
  }

  async updateQuantity(userId: string, productId: number, quantity: number): Promise<CartItem> {
    return await this.prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity }
    });
  }

  async removeItem(userId: string, productId: number): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } }
    });
  }

  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isActive: true,
            quantity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return items.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price)
      }
    }));
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { userId }
    });
  }

  async getItemCount(userId: string): Promise<number> {
    const result = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true }
    });
    return result._sum.quantity || 0;
  }
}
