import api from './client';
import type { Plantilla, PlantillaRequest, Page } from '../types';

export const plantillasApi = {
  getAll: (page = 0, size = 10) =>
    api
      .get<Page<Plantilla>>('/plantillas', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Plantilla>(`/plantillas/${id}`).then((r) => r.data),

  create: (data: PlantillaRequest) =>
    api.post<Plantilla>('/plantillas', data).then((r) => r.data),

  update: (id: number, data: PlantillaRequest) =>
    api.put<Plantilla>(`/plantillas/${id}`, data).then((r) => r.data),

  deactivate: (id: number) => api.patch(`/plantillas/${id}/deactivate`),

  delete: (id: number) => api.delete(`/plantillas/${id}`),
};
