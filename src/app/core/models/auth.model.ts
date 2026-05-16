export interface User {
  id: number;
  email: string;
  fullName?: string;
  role: 'DRIVER' | 'MANAGER' | 'ADMIN';
  phone?: string;
  active?: boolean;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  userId: number;
  email: string;
  role: string;
  fullName?: string;
}