import { AddressRepository, UpdateAddressData } from '../../../domain/repositories/AddressRepository';
import { Address } from '../../../domain/entities/Address';

export class UpdateAddressUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute(addressId: string, userId: string, data: UpdateAddressData): Promise<Address> {
    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await this.addressRepository.findById(addressId);
    if (!existingAddress) {
      throw new Error('Address not found');
    }
    if (existingAddress.userId !== userId) {
      throw new Error('Access denied');
    }

    const updatedAddress = await this.addressRepository.update(addressId, data);

    // Si se marca como predeterminada, desmarcar las otras
    if (data.isDefault) {
      await this.addressRepository.setAsDefault(userId, addressId);
    }

    return updatedAddress;
  }
}
