import { api } from './api.js';
import { StaffUser, CreateStaffPayload, UpdateStaffPayload } from '../types/staff.js';

export async function getStaffList(): Promise<StaffUser[]> {
  const res = await api.get<{ success: boolean; data: StaffUser[] }>('/staff');
  return res.data.data;
}

export async function getStaffDetail(id: string): Promise<StaffUser> {
  const res = await api.get<{ success: boolean; data: StaffUser }>(`/staff/${id}`);
  return res.data.data;
}

export async function createStaffMember(
  payload: CreateStaffPayload
): Promise<{ staff: StaffUser; temporaryPassword?: string }> {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: StaffUser;
    temporaryPassword?: string;
  }>('/staff', payload);
  return { staff: res.data.data, temporaryPassword: res.data.temporaryPassword };
}

export async function updateStaffMember(id: string, payload: UpdateStaffPayload): Promise<StaffUser> {
  const res = await api.patch<{ success: boolean; data: StaffUser }>(`/staff/${id}`, payload);
  return res.data.data;
}

export async function toggleStaffStatus(id: string, isActive: boolean): Promise<StaffUser> {
  const res = await api.patch<{ success: boolean; data: StaffUser }>(`/staff/${id}/status`, { isActive });
  return res.data.data;
}
