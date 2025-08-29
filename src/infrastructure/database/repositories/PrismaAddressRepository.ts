import { PrismaClient } from '@prisma/client';
import { AddressRepository, CreateAddressData, UpdateAddressData } from '../../../domain/repositories/AddressRepository';
import { Address } from '../../../domain/entities/Address';

export class PrismaAddressRepository implements AddressRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAddressData): Promise<Address> {
    return await this.prisma.address.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'EC',
        phone: data.phone,
        isDefault: data.isDefault || false,
        instructions: data.instructions
      }
    });
  }

  async findById(id: string): Promise<Address | null> {
    return await this.prisma.address.findUnique({
      where: { id }
    });
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return await this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  }

  async update(id: string, data: UpdateAddressData): Promise<Address> {
    return await this.prisma.address.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id }
    });
  }

  async setAsDefault(userId: string, addressId: string): Promise<Address> {
    await this.prisma.$transaction(async (tx) => {
      // Desmarcar todas las direcciones como predeterminadas
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });

      // Marcar la dirección específica como predeterminada
      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      });
    });

    return await this.prisma.address.findUniqueOrThrow({
      where: { id: addressId }
    });
  }
}
