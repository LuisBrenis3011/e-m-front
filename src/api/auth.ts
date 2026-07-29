import api from './client';
import type {
  LoginRequest,
  RegisterRequest,
  JwtResponse,
  Usuario,
  Proveedor,
} from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<JwtResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<JwtResponse>('/auth/register', data).then((r) => r.data),

  me: () => api.get<Usuario>('/auth/me').then((r) => r.data),

  getProveedor: () =>
    api.get<Proveedor>('/auth/proveedor').then((r) => r.data),

  updateProveedor: (data: Partial<Proveedor>) =>
    api.put<Proveedor>('/auth/proveedor', data).then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
};
