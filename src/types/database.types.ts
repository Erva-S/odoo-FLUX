export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "staff" | "customer";
export type SubscriptionStatus = "draft" | "quotation" | "confirmed" | "active" | "closed";
export type InvoiceStatus = "draft" | "confirmed" | "paid" | "cancelled";
export type BillingPeriodType = "daily" | "weekly" | "monthly" | "yearly";
export type DiscountType = "percentage" | "fixed";
export type DiscountTarget = "whole_subscription" | "specific_products";
export type PaymentMethod = "bank_transfer" | "credit_card" | "wire" | "ach";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          company_name: string | null;
          phone: string | null;
          billing_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: UserRole;
          company_name?: string | null;
          phone?: string | null;
          billing_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          company_name?: string | null;
          phone?: string | null;
          billing_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      taxes: {
        Row: {
          id: string;
          name: string;
          rate: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          rate: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          rate?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          type: string;
          sales_price: number;
          cost_price: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          sales_price: number;
          cost_price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          sales_price?: number;
          cost_price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          attribute_name: string;
          attribute_value: string;
          price_extra: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          attribute_name: string;
          attribute_value: string;
          price_extra?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          attribute_name?: string;
          attribute_value?: string;
          price_extra?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          billing_period: BillingPeriodType;
          minimum_quantity: number;
          available_from: string | null;
          available_to: string | null;
          auto_close: boolean;
          allow_early_close: boolean;
          allow_pause: boolean;
          allow_renew: boolean;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          billing_period?: BillingPeriodType;
          minimum_quantity?: number;
          available_from?: string | null;
          available_to?: string | null;
          auto_close?: boolean;
          allow_early_close?: boolean;
          allow_pause?: boolean;
          allow_renew?: boolean;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          billing_period?: BillingPeriodType;
          minimum_quantity?: number;
          available_from?: string | null;
          available_to?: string | null;
          auto_close?: boolean;
          allow_early_close?: boolean;
          allow_pause?: boolean;
          allow_renew?: boolean;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      discounts: {
        Row: {
          id: string;
          code: string;
          name: string;
          type: DiscountType;
          value: number;
          min_purchase: number;
          min_quantity: number;
          start_date: string | null;
          end_date: string | null;
          usage_limit: number | null;
          times_used: number;
          applies_to: DiscountTarget;
          product_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          type: DiscountType;
          value: number;
          min_purchase?: number;
          min_quantity?: number;
          start_date?: string | null;
          end_date?: string | null;
          usage_limit?: number | null;
          times_used?: number;
          applies_to?: DiscountTarget;
          product_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          type?: DiscountType;
          value?: number;
          min_purchase?: number;
          min_quantity?: number;
          start_date?: string | null;
          end_date?: string | null;
          usage_limit?: number | null;
          times_used?: number;
          applies_to?: DiscountTarget;
          product_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      quotation_templates: {
        Row: {
          id: string;
          name: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quotation_template_lines: {
        Row: {
          id: string;
          template_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
        };
        Insert: {
          id?: string;
          template_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
        };
        Update: {
          id?: string;
          template_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          subscription_number: string;
          customer_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          start_date: string;
          expiry_date: string | null;
          payment_terms: string;
          discount_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subscription_number: string;
          customer_id: string;
          plan_id: string;
          status?: SubscriptionStatus;
          start_date: string;
          expiry_date?: string | null;
          payment_terms?: string;
          discount_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subscription_number?: string;
          customer_id?: string;
          plan_id?: string;
          status?: SubscriptionStatus;
          start_date?: string;
          expiry_date?: string | null;
          payment_terms?: string;
          discount_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscription_lines: {
        Row: {
          id: string;
          subscription_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          tax_id: string | null;
          tax_rate: number;
          amount: number;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price: number;
          tax_id?: string | null;
          tax_rate?: number;
          amount: number;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price?: number;
          tax_id?: string | null;
          tax_rate?: number;
          amount?: number;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          subscription_id: string;
          customer_id: string;
          billing_period_start: string;
          billing_period_end: string;
          status: InvoiceStatus;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          amount_paid: number;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          subscription_id: string;
          customer_id: string;
          billing_period_start: string;
          billing_period_end: string;
          status?: InvoiceStatus;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          due_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          subscription_id?: string;
          customer_id?: string;
          billing_period_start?: string;
          billing_period_end?: string;
          status?: InvoiceStatus;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_lines: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          tax_rate: number;
          amount: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_id: string;
          description: string;
          quantity?: number;
          unit_price: number;
          tax_rate?: number;
          amount: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          product_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tax_rate?: number;
          amount?: number;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          customer_id: string;
          amount: number;
          method: PaymentMethod;
          payment_date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          customer_id: string;
          amount: number;
          method?: PaymentMethod;
          payment_date?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          customer_id?: string;
          amount?: number;
          method?: PaymentMethod;
          payment_date?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      discount_usages: {
        Row: {
          id: string;
          discount_id: string;
          subscription_id: string | null;
          invoice_id: string | null;
          customer_id: string;
          used_at: string;
        };
        Insert: {
          id?: string;
          discount_id: string;
          subscription_id?: string | null;
          invoice_id?: string | null;
          customer_id: string;
          used_at?: string;
        };
        Update: {
          id?: string;
          discount_id?: string;
          subscription_id?: string | null;
          invoice_id?: string | null;
          customer_id?: string;
          used_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      generate_recurring_invoices: {
        Args: Record<PropertyKey, never>;
        Returns: {
          created_count: number;
          skipped_count: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_status: SubscriptionStatus;
      invoice_status: InvoiceStatus;
      billing_period_type: BillingPeriodType;
      discount_type: DiscountType;
      discount_target: DiscountTarget;
      payment_method: PaymentMethod;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
