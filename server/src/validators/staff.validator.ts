import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  password: z
    .string()
    .min(9, 'Password must be more than 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, 'Must contain at least one special character')
    .optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  email: z.string().email('Valid email is required').toLowerCase().trim().optional(),
});

export const updateStaffStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status is required' }),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type UpdateStaffStatusInput = z.infer<typeof updateStaffStatusSchema>;
