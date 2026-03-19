export interface User {
  id: number;
  name: string;
  username: string;
  photo_profile: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface VerifyTokenResponse {
  status: string;
  message: string;
  data: {
    valid: boolean;
    email?: string;
  };
}

export interface GenericResponse {
  status: string;
  message: string;
}
