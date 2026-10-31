import { api } from './api.js';
import { User, AuthResponse } from '../types/auth.js';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  businessName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/login', payload);
  if (!res.data.user) {
    throw new Error('Authentication succeeded but user payload missing');
  }
  return res.data.user;
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  if (!res.data.user) {
    throw new Error('Registration succeeded but user payload missing');
  }
  return res.data.user;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<{ success: boolean; user: User }>('/auth/me');
  return res.data.user;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
  return res.data.message;
}

export async function completePasswordReset(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<string> {
  const res = await api.post<{ success: boolean; message: string }>('/auth/reset-password', payload);
  return res.data.message;
}

export async function syncPasswordReset(payload: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<string> {
  const res = await api.post<{ success: boolean; message: string }>('/auth/sync-password', payload);
  return res.data.message;
}
