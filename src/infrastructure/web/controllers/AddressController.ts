import { Request, Response } from 'express';
import { CreateAddressUseCase } from '../../../application/use-cases/addresses/CreateAddressUseCase';
import { GetAddressesUseCase } from '../../../application/use-cases/addresses/GetAddressesUseCase';
import { UpdateAddressUseCase } from '../../../application/use-cases/addresses/UpdateAddressUseCase';
import { DeleteAddressUseCase } from '../../../application/use-cases/addresses/DeleteAddressUseCase';

export class AddressController {
  constructor(
    private createAddressUseCase: CreateAddressUseCase,
    private getAddressesUseCase: GetAddressesUseCase,
    private updateAddressUseCase: UpdateAddressUseCase,
    private deleteAddressUseCase: DeleteAddressUseCase
  ) {}

  async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addressData = { ...req.body, userId };
      const address = await this.createAddressUseCase.execute(addressData);
      res.status(201).json(address);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create address';
      res.status(400).json({ error: message });
    }
  }

  async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addresses = await this.getAddressesUseCase.execute(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get addresses' });
    }
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const address = await this.updateAddressUseCase.execute(id, userId, req.body);
      res.json(address);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update address';
      const status = message === 'Address not found' ? 404 : 
                    message === 'Access denied' ? 403 : 400;
      res.status(status).json({ error: message });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await this.deleteAddressUseCase.execute(id, userId);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete address';
      const status = message === 'Address not found' ? 404 : 
                    message === 'Access denied' ? 403 : 400;
      res.status(status).json({ error: message });
    }
  }
}
