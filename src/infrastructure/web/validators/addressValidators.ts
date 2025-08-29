import { z } from 'zod';

export const createAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  company: z.string().max(100).optional(),
  address1: z.string().min(1, 'Address is required').max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().length(2, 'Country must be 2 characters').optional(),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
  instructions: z.string().max(500).optional()
});

export const updateAddressSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  company: z.string().max(100).optional(),
  address1: z.string().min(1).max(200).optional(),
  address2: z.string().max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: z.string().length(2).optional(),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
  instructions: z.string().max(500).optional()
});

export const addressIdSchema = z.object({
  id: z.string().min(1, 'Address ID is required')
});

export type CreateAddressRequest = z.infer<typeof createAddressSchema>;
export type UpdateAddressRequest = z.infer<typeof updateAddressSchema>;
export type AddressIdParams = z.infer<typeof addressIdSchema>;
