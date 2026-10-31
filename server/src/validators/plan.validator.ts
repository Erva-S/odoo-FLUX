import { z } from 'zod';

export const createPlanSchema = z
  .object({
    name: z.string().min(2, 'Plan name must have at least 2 characters').max(150),
    code: z
      .string()
      .min(2, 'Plan code must have at least 2 characters')
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/, 'Plan code must only contain letters, numbers, hyphens, and underscores'),
    description: z.string().max(1000).optional().nullable(),
    productId: z.string().uuid('Invalid productId UUID format'),
    variantId: z.string().uuid('Invalid variantId UUID format').optional().nullable(),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    billingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME']).default('MONTHLY'),
    minQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
    startDate: z.string().datetime().optional().nullable().or(z.literal('')),
    endDate: z.string().datetime().optional().nullable().or(z.literal('')),
    autoCloseOnEnd: z.boolean().default(false),
    allowEarlyClosure: z.boolean().default(true),
    allowPause: z.boolean().default(true),
    allowRenewal: z.boolean().default(true),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
    pauseLimitCycles: z.coerce.number().int().min(0).max(24).default(2),
    cancellationNoticeDays: z.coerce.number().int().min(0).max(365).default(30),
    trialPeriodDays: z.coerce.number().int().min(0).max(90).default(0),
    features: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Availability end date cannot be earlier than start date',
      path: ['endDate'],
    }
  );

export const updatePlanSchema = z
  .object({
    name: z.string().min(2).max(150).optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional(),
    description: z.string().max(1000).optional().nullable(),
    productId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional().nullable(),
    price: z.coerce.number().min(0).optional(),
    billingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME']).optional(),
    minQuantity: z.coerce.number().int().min(1).optional(),
    startDate: z.string().datetime().optional().nullable().or(z.literal('')),
    endDate: z.string().datetime().optional().nullable().or(z.literal('')),
    autoCloseOnEnd: z.boolean().optional(),
    allowEarlyClosure: z.boolean().optional(),
    allowPause: z.boolean().optional(),
    allowRenewal: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    pauseLimitCycles: z.coerce.number().int().min(0).max(24).optional(),
    cancellationNoticeDays: z.coerce.number().int().min(0).max(365).optional(),
    trialPeriodDays: z.coerce.number().int().min(0).max(90).optional(),
    features: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Availability end date cannot be earlier than start date',
      path: ['endDate'],
    }
  );

export const updatePlanStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
});

export const queryPlanSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  billingFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME']).optional(),
  productId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'name', 'code', 'price', 'billingFrequency', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type QueryPlanInput = z.infer<typeof queryPlanSchema>;

