import { AddressRepository, CreateAddressData } from '../../../domain/repositories/AddressRepository';
import { Address } from '../../../domain/entities/Address';

export class CreateAddressUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute(data: CreateAddressData): Promise<Address> {
    // Si es la primera dirección del usuario, marcarla como predeterminada
    const existingAddresses = await this.addressRepository.findByUserId(data.userId);
    const isFirstAddress = existingAddresses.length === 0;

    const addressData = {
      ...data,
      country: data.country || 'EC', // Ecuador por defecto
      isDefault: data.isDefault || isFirstAddress
    };

    const address = await this.addressRepository.create(addressData);

    // Si se marca como predeterminada, desmarcar las otras
    if (address.isDefault && !isFirstAddress) {
      await this.addressRepository.setAsDefault(data.userId, address.id);
    }

    return address;
  }
}
