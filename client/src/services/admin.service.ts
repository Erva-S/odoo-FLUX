import { api } from './api.js';
import { AdminDashboardData } from '../types/dashboard.js';
import { User, Role } from '../types/auth.js';

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await api.get<{ success: boolean; data: AdminDashboardData }>('/admin/dashboard');
  return res.data.data;
}

export async function fetchUsersList(role?: Role): Promise<User[]> {
  const params = role ? { role } : {};
  const res = await api.get<{ success: boolean; data: User[] }>('/admin/users', { params });
  return res.data.data;
}
