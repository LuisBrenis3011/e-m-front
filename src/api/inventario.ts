import api from './client';
import type { Inventario, InventarioRequest, Page } from '../types';

export const inventarioApi = {
  getAll: (page = 0, size = 10) =>
    api
      .get<Page<Inventario>>('/inventario', { params: { page, size } })
      .then((r) => r.data),

  search: (q: string) =>
    api
      .get<Inventario[]>('/inventario/search', { params: { q } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Inventario>(`/inventario/${id}`).then((r) => r.data),

  create: (data: InventarioRequest) =>
    api.post<Inventario>('/inventario', data).then((r) => r.data),

  update: (id: number, data: InventarioRequest) =>
    api.put<Inventario>(`/inventario/${id}`, data).then((r) => r.data),

  deactivate: (id: number) => api.patch(`/inventario/${id}/deactivate`),

  delete: (id: number) => api.delete(`/inventario/${id}`),
};
