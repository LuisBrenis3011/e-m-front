import api from './client';
import type { Categoria, Tematica } from '../types';

export const categoriasApi = {
  getAll: () => api.get<Categoria[]>('/categorias').then((r) => r.data),

  getById: (id: number) =>
    api.get<Categoria>(`/categorias/${id}`).then((r) => r.data),

  getTematicas: (categoriaId?: number) => {
    const url = categoriaId
      ? `/tematicas?categoriaId=${categoriaId}`
      : '/tematicas';
    return api.get<Tematica[]>(url).then((r) => r.data);
  },

  getTematicaById: (id: number) =>
    api.get<Tematica>(`/tematicas/${id}`).then((r) => r.data),

  getTematicasByCategoria: (categoriaId: number) =>
    api
      .get<Tematica[]>(`/categorias/${categoriaId}/tematicas`)
      .then((r) => r.data),
};
