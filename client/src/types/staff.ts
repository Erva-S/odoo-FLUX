import { Role } from './auth.js';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
}
