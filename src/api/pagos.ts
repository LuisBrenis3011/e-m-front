import api from './client';
import type { Pago, Page } from '../types';

export const pagosApi = {
  getByContrato: (contratoId: number, page = 0, size = 10) =>
    api
      .get<Page<Pago>>(`/pagos/contrato/${contratoId}`, {
        params: { page, size },
      })
      .then((r) => r.data),

  getPendientes: (page = 0, size = 10) =>
    api
      .get<Page<Pago>>('/pagos/pendientes', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Pago>(`/pagos/${id}`).then((r) => r.data),

  create: (data: FormData) =>
    api.post<Pago>('/pagos', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  verificar: (id: number) => api.patch(`/pagos/${id}/verificar`),

  rechazar: (id: number, motivo: string) =>
    api.patch(`/pagos/${id}/rechazar`, null, { params: { motivo } }),
};
