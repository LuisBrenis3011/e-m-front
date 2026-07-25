import api from './client';
import type { Documento } from '../types';

export const documentosApi = {
  generar: (contratoId: number) =>
    api
      .post<Documento>(`/documentos/generar/${contratoId}`)
      .then((r) => r.data),

  getHistorial: (contratoId: number) =>
    api
      .get<Documento[]>(`/documentos/contrato/${contratoId}`)
      .then((r) => r.data),
};
