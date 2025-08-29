import { AddressRepository } from '../../../domain/repositories/AddressRepository';
import { Address } from '../../../domain/entities/Address';

export class GetAddressesUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute(userId: string): Promise<Address[]> {
    const addresses = await this.addressRepository.findByUserId(userId);
    
    // Ya vienen ordenadas desde el repositorio: predeterminada primero
    return addresses;
  }
}
