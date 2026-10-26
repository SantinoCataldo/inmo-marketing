import { UserRole, UserStatus } from './auth.models';

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  inmobiliariaId: number;
  inmobiliariaNombre: string;
}

export interface UserUpdateRequest {
  nombre?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}
