import api from './client';
import type { Cliente, ClienteRequest, Page } from '../types';

export const clientesApi = {
  getAll: (page = 0, size = 10, sort = 'nombreCompleto,asc') =>
    api
      .get<Page<Cliente>>('/clientes', { params: { page, size, sort } })
      .then((r) => r.data),

  search: (q: string) =>
    api
      .get<Page<Cliente>>('/clientes', { params: { q } })
      .then((r) => r.data),

  getByDni: (dni: string) =>
    api.get<Cliente>('/clientes', { params: { dni } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<Cliente>(`/clientes/${id}`).then((r) => r.data),

  create: (data: ClienteRequest) =>
    api.post<Cliente>('/clientes', data).then((r) => r.data),

  update: (id: number, data: ClienteRequest) =>
    api.put<Cliente>(`/clientes/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/clientes/${id}`),
};
