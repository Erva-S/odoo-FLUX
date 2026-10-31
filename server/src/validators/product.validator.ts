import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must have at least 2 characters').max(150),
  code: z
    .string()
    .min(2, 'Product code must have at least 2 characters')
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, 'Product code must only contain letters, numbers, hyphens, and underscores'),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(2).max(100).default('Core SaaS'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  variants: z
    .array(
      z.object({
        name: z.string().min(2),
        code: z.string().min(2).max(50),
        description: z.string().max(500).optional().nullable(),
        price: z.coerce.number().min(0, 'Price must be non-negative'),
        status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
      })
    )
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().min(2).max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
});

export const createVariantSchema = z.object({
  name: z.string().min(2, 'Variant name must have at least 2 characters').max(150),
  code: z
    .string()
    .min(2, 'Variant code must have at least 2 characters')
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, 'Variant code must only contain letters, numbers, hyphens, and underscores'),
  description: z.string().max(500).optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const updateVariantSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
  description: z.string().max(500).optional().nullable(),
  price: z.coerce.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const queryProductSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'code', 'category', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;

