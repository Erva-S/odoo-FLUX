export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface CustomerDetails {
  id: string;
  userId: string;
  companyName: string | null;
  contactNumber: string | null;
  billingAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  customer?: CustomerDetails | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}
