import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().nullable(),
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  isDefault: z.boolean(),
  instructions: z.string().nullable(),
});

export type Address = z.infer<typeof AddressSchema>;
