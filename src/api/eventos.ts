import api from './client';
import type { Evento, EventoRequest, Page, CalendarioQuery } from '../types';

export const eventosApi = {
  getCalendario: (query: CalendarioQuery) =>
    api
      .get<Page<Evento>>('/eventos/calendario', { params: query })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Evento>(`/eventos/${id}`).then((r) => r.data),

  create: (data: EventoRequest) =>
    api.post<Evento>('/eventos', data).then((r) => r.data),

  update: (id: number, data: EventoRequest) =>
    api.put<Evento>(`/eventos/${id}`, data).then((r) => r.data),

  changeEstado: (id: number, estado: string) =>
    api
      .patch<Evento>(`/eventos/${id}/estado`, null, { params: { estado } })
      .then((r) => r.data),

  getByCliente: (clienteId: number) =>
    api
      .get<Evento[]>(`/eventos/cliente/${clienteId}`)
      .then((r) => r.data),

  delete: (id: number) => api.delete(`/eventos/${id}`),
};
