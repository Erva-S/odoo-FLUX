import { z } from 'zod';

export const updateCustomerProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  companyName: z.string().max(150).trim().optional().nullable(),
  contactNumber: z.string().max(30).trim().optional().nullable(),
  billingAddress: z.string().max(500).trim().optional().nullable(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
