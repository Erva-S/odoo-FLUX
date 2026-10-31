import { api } from './api.js';
import { User } from '../types/auth.js';

export interface UpdateCustomerPayload {
  name?: string;
  companyName?: string | null;
  contactNumber?: string | null;
  billingAddress?: string | null;
}

export async function fetchCustomerProfile(): Promise<User> {
  const res = await api.get<{ success: boolean; data: User }>('/customers/me');
  return res.data.data;
}

export async function updateCustomerProfile(payload: UpdateCustomerPayload): Promise<User> {
  const res = await api.patch<{ success: boolean; message: string; data: User }>('/customers/me', payload);
  return res.data.data;
}
