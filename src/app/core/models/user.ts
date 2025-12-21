export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  age?: number;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  age?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}