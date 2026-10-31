export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type BillingFrequency = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | 'ONE_TIME';

export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  code: string;
  description?: string | null;
  price: string | number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    plans: number;
  };
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  category: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  plans?: Plan[];
  _count?: {
    plans: number;
    variants: number;
  };
}

export interface Plan {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  price: string | number;
  billingFrequency: BillingFrequency;
  status: PlanStatus;
  pauseLimitCycles: number;
  cancellationNoticeDays: number;
  trialPeriodDays: number;
  features?: string[] | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    code: string;
    category?: string;
    status: ProductStatus;
  };
  variant?: {
    id: string;
    name: string;
    code: string;
    price: string | number;
    status: ProductStatus;
  } | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  items: Product[];
  pagination: PaginationMeta;
  metrics: {
    total: number;
    activeCount: number;
    inactiveCount: number;
  };
}

export interface PlansResponse {
  items: Plan[];
  pagination: PaginationMeta;
  metrics: {
    total: number;
    activeCount: number;
    inactiveCount: number;
  };
}

