import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional(),
  isDefault: z.boolean(),
  instructions: z.string().optional(),
});

export type Address = z.infer<typeof AddressSchema>;
