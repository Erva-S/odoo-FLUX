import { api } from './api.js';
import { Product, ProductVariant, ProductsResponse } from '../types/catalog.js';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  name: string;
  code: string;
  description?: string;
  category?: string;
  status?: string;
  variants?: {
    name: string;
    code: string;
    description?: string;
    price: number;
    status?: string;
  }[];
}

export interface UpdateProductPayload {
  name?: string;
  code?: string;
  description?: string;
  category?: string;
  status?: string;
}

export interface CreateVariantPayload {
  name: string;
  code: string;
  description?: string;
  price: number;
  status?: string;
}

export interface UpdateVariantPayload {
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  status?: string;
}

export async function fetchProducts(params: ProductQueryParams = {}): Promise<ProductsResponse> {
  const response = await api.get('/products', { params });
  return response.data.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const response = await api.post('/products', payload);
  return response.data.data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const response = await api.put(`/products/${id}`, payload);
  return response.data.data;
}

export async function updateProductStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'): Promise<Product> {
  const response = await api.patch(`/products/${id}/status`, { status });
  return response.data.data;
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

// Variants
export async function fetchProductVariants(productId: string): Promise<{ product: Product; variants: ProductVariant[] }> {
  const response = await api.get(`/products/${productId}/variants`);
  return response.data.data;
}

export async function createProductVariant(productId: string, payload: CreateVariantPayload): Promise<ProductVariant> {
  const response = await api.post(`/products/${productId}/variants`, payload);
  return response.data.data;
}

export async function updateProductVariant(id: string, payload: UpdateVariantPayload): Promise<ProductVariant> {
  const response = await api.put(`/variants/${id}`, payload);
  return response.data.data;
}

export async function updateVariantStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'): Promise<ProductVariant> {
  const response = await api.patch(`/variants/${id}/status`, { status });
  return response.data.data;
}

export async function deleteVariant(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/variants/${id}`);
  return response.data;
}

