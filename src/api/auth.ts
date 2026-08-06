import api from './client';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterEmpresaRequest,
  JwtResponse,
  Usuario,
  Proveedor,
} from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<JwtResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post<JwtResponse>('/auth/register', data).then((r) => r.data),

  registerEmpresa: (data: RegisterEmpresaRequest) =>
    api.post<JwtResponse>('/auth/register-empresa', data).then((r) => r.data),

  me: () => api.get<Usuario>('/auth/me').then((r) => r.data),

  getProveedor: () =>
    api.get<Proveedor>('/auth/proveedor').then((r) => r.data),

  updateProveedor: (data: Partial<Proveedor>) =>
    api.put<Proveedor>('/auth/proveedor', data).then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),

  registerGoogle: (data: { email: string; nombre: string; apellido: string; ruc: string; telefono: string }) =>
    api.post<JwtResponse>('/auth/register-google', data).then((r) => r.data),

  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api
      .post<{ logoUrl: string }>('/auth/proveedor/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
