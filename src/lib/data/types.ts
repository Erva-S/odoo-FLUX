export type SubscriptionStatus = "draft" | "quotation" | "confirmed" | "active" | "closed";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "customer";
  companyName?: string;
  phone?: string;
  billingAddress?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributeName: string;
  attributeValue: string;
  priceExtra: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes?: string;
  variants: ProductVariant[];
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "daily" | "weekly" | "monthly" | "yearly";
  minimumQuantity: number;
  availableFrom?: string;
  availableTo?: string;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  description?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  minQuantity: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  timesUsed: number;
  appliesTo: "whole_subscription" | "specific_products";
  productId?: string;
  isActive: boolean;
}

export interface SubscriptionLine {
  id: string;
  subscriptionId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string; // e.g. SUB-0001
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate?: string;
  paymentTerms: string;
  discountId?: string;
  discountCode?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  lines: SubscriptionLine[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  subscriptionId: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerAddress?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  status: "draft" | "confirmed" | "paid" | "cancelled";
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  dueDate: string;
  isOverdue?: boolean;
  lines: InvoiceLine[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: "bank_transfer" | "credit_card" | "wire" | "ach";
  paymentDate: string;
  note?: string;
  createdAt: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  notes?: string;
  lines: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
}

