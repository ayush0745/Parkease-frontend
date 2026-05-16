export interface UserProfileDTO {
  userId?: number;
  fullName: string;
  email: string;
  phone?: string;
  vehiclePlate?: string;
  role: string;
  isActive: boolean;
  profilePicUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfileDTO;
}
