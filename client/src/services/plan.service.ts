import { api } from './api.js';
import { Plan, PlansResponse } from '../types/catalog.js';

export interface PlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  billingFrequency?: string;
  productId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanPayload {
  name: string;
  code: string;
  description?: string;
  productId: string;
  variantId?: string | null;
  price: number;
  billingFrequency: string;
  status?: string;
  pauseLimitCycles?: number;
  cancellationNoticeDays?: number;
  trialPeriodDays?: number;
  features?: string[];
}

export interface UpdatePlanPayload {
  name?: string;
  code?: string;
  description?: string;
  productId?: string;
  variantId?: string | null;
  price?: number;
  billingFrequency?: string;
  status?: string;
  pauseLimitCycles?: number;
  cancellationNoticeDays?: number;
  trialPeriodDays?: number;
  features?: string[];
}

export async function fetchPlans(params: PlanQueryParams = {}): Promise<PlansResponse> {
  const response = await api.get('/plans', { params });
  return response.data.data;
}

export async function fetchPlanById(id: string): Promise<Plan> {
  const response = await api.get(`/plans/${id}`);
  return response.data.data;
}

export async function createPlan(payload: CreatePlanPayload): Promise<Plan> {
  const response = await api.post('/plans', payload);
  return response.data.data;
}

export async function updatePlan(id: string, payload: UpdatePlanPayload): Promise<Plan> {
  const response = await api.put(`/plans/${id}`, payload);
  return response.data.data;
}

export async function updatePlanStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'): Promise<Plan> {
  const response = await api.patch(`/plans/${id}/status`, { status });
  return response.data.data;
}

export async function deletePlan(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
}

