export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  nombreInmobiliaria: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface DecodedToken {
  sub: string;
  roles?: string[];
  role?: string;
  inmobiliariaId?: number;
  exp: number;
  iat: number;
  [key: string]: unknown;
}
