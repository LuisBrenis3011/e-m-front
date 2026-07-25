import api from './client';
import type { Paquete, PaqueteRequest, Page } from '../types';

export const paquetesApi = {
  getAll: (page = 0, size = 10, categoriaId?: number) =>
    api
      .get<Page<Paquete>>('/paquetes', {
        params: { page, size, ...(categoriaId ? { categoriaId } : {}) },
      })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Paquete>(`/paquetes/${id}`).then((r) => r.data),

  create: (data: PaqueteRequest) =>
    api.post<Paquete>('/paquetes', data).then((r) => r.data),

  update: (id: number, data: PaqueteRequest) =>
    api.put<Paquete>(`/paquetes/${id}`, data).then((r) => r.data),

  deactivate: (id: number) => api.patch(`/paquetes/${id}/deactivate`),
};
