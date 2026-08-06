import api from './client';
import type { Contrato, ContratoRequest, ContratoDetalle, Page } from '../types';

export const contratosApi = {
  getAll: (page = 0, size = 10, desde?: string, hasta?: string) =>
    api
      .get<Page<Contrato>>('/contratos', { params: { page, size, ...(desde ? { desde } : {}), ...(hasta ? { hasta } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Contrato>(`/contratos/${id}`).then((r) => r.data),

  getByEvento: (eventoId: number) =>
    api.get<Contrato>(`/contratos/evento/${eventoId}`).then((r) => r.data),

  create: (data: ContratoRequest) =>
    api.post<Contrato>('/contratos', data).then((r) => r.data),

  addDetalle: (
    contratoId: number,
    data: Omit<ContratoDetalle, 'id' | 'inventarioNombre'>
  ) =>
    api
      .post<ContratoDetalle>(`/contratos/${contratoId}/detalles`, data)
      .then((r) => r.data),

  removeDetalle: (detalleId: number) =>
    api.delete(`/contratos/detalles/${detalleId}`),

  changeEstado: (id: number, estado: string) =>
    api.patch(`/contratos/${id}/estado`, null, { params: { estado } }),

  delete: (id: number) => api.delete(`/contratos/${id}`),
};
