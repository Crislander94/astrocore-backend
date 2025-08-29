import { AddressRepository } from '../../../domain/repositories/AddressRepository';

export class DeleteAddressUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute(addressId: string, userId: string): Promise<void> {
    // Verificar que la dirección existe y pertenece al usuario
    const existingAddress = await this.addressRepository.findById(addressId);
    if (!existingAddress) {
      throw new Error('Address not found');
    }
    if (existingAddress.userId !== userId) {
      throw new Error('Access denied');
    }

    await this.addressRepository.delete(addressId);
  }
}
