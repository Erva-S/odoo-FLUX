export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY' | 'ONE_TIME';

export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  code: string;
  description?: string | null;
  additionalPrice: string | number;
  price: string | number;
  calculatedFinalPrice?: number;
  attributes?: Record<string, any> | null;
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
  type?: string;
  salesPrice?: string | number;
  price?: string | number;
  costPrice?: string | number;
  notes?: string | null;
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

export interface PlanPricingBreakdown {
  productBasePrice: number;
  baseSalesPrice?: number;
  variantAdditionalPrice: number;
  calculatedProductPrice: number;
  planPrice: number;
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
  minQuantity: number;
  startDate?: string | null;
  endDate?: string | null;
  autoCloseOnEnd: boolean;
  allowEarlyClosure: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  isCurrentlyAvailable?: boolean;
  pricingBreakdown?: PlanPricingBreakdown;
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
    type?: string;
    salesPrice: string | number;
    category?: string;
    status: ProductStatus;
  };
  variant?: {
    id: string;
    name: string;
    code: string;
    additionalPrice?: string | number;
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

