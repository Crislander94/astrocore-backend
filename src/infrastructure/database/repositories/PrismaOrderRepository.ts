import { Prisma, PrismaClient } from '@prisma/client';
import { OrderRepository, CreateOrderData } from '../../../domain/repositories/OrderRepository';
import { Order, OrderWithDetails, OrderStatus } from '../../../domain/entities/Order';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateOrderData): Promise<OrderWithDetails> {
    const order = await this.prisma.$transaction(async (tx) => {
      // Crear la orden
      console.log({dataOrder: data});
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          userId: data.userId,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          discount: data.discount,
          total: data.total,
          shippingAddressId: data.shippingAddressId,
          notes: data.notes,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          currency: 'USD'
        }
      });
      // Crear los items de la orden
      await tx.orderItem.createMany({
        data: data.items.map(item => ({
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      });
      // Actualizar stock de los productos
      return createdOrder;
    });
    const newOrderItems = data.items.map(item => ({
      ...item,
      id: '', // Placeholder, as we don't have the ID from createMany
      orderId: order.id,
      total: Number(item.total)
    }));

    const shippingAddress = data.shippingAddressId 
      ? await this.prisma.address.findUnique({
          where: { id: data.shippingAddressId },
          select: {
            firstName: true,
            lastName: true,
            address1: true,
            city: true,
            state: true,
            postalCode: true,
            phone: true
          }
        })
      : null;

    return {
      ...order,
      items: newOrderItems,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingAddress,
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as any
    };
  }

  async findById(id: string): Promise<OrderWithDetails | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        shippingAddress: {
          select: {
            firstName: true,
            lastName: true,
            address1: true,
            city: true,
            state: true,
            postalCode: true,
            phone: true
          }
        }
      }
    });

    if (!order) return null;
    console.log({orderFound: order});
    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as any,
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
        product: item.product
      }))
    };
  }

  async findByUserId(userId: string, page: number, limit: number): Promise<{
    orders: OrderWithDetails[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              }
            }
          },
          shippingAddress: {
            select: {
              firstName: true,
              lastName: true,
              address1: true,
              city: true,
              state: true,
              postalCode: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.order.count({ where: { userId } })
    ]);
    console.log(JSON.stringify({orderFound: orders}, null, 2));
    return {
      orders: orders.map(order => ({
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shipping: Number(order.shipping),
        discount: Number(order.discount),
        total: Number(order.total),
        status: order.status as OrderStatus,
        paymentStatus: order.paymentStatus as any,
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
          product: item.product
        }))
      })),
      total
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status }
    });

    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      discount: Number(order.discount),
      total: Number(order.total),
      status: order.status as OrderStatus,
      paymentStatus: order.paymentStatus as any
    };
  }

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  async validateAddressExists(addressId: string, userId: string): Promise<boolean> {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId
      }
    });
    return !!address;
  }
}
