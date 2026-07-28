import api from './client';
import type { Categoria, Tematica } from '../types';

export const categoriasApi = {
  getAll: () => api.get<Categoria[]>('/categorias').then((r) => r.data),

  getById: (id: number) =>
    api.get<Categoria>(`/categorias/${id}`).then((r) => r.data),

  create: (data: { nombre: string; descripcion: string }) =>
    api.post<Categoria>('/categorias', data).then((r) => r.data),

  update: (id: number, data: { nombre: string; descripcion: string }) =>
    api.put<Categoria>(`/categorias/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/categorias/${id}`),

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

  createTematica: (categoriaId: number, data: { nombre: string; imagenReferencial?: string | null }) =>
    api
      .post<Tematica>(`/tematicas`, data, { params: { categoriaId } })
      .then((r) => r.data),

  updateTematica: (id: number, categoriaId: number, data: { nombre: string; imagenReferencial?: string | null }) =>
    api
      .put<Tematica>(`/tematicas/${id}`, data, { params: { categoriaId } })
      .then((r) => r.data),

  deleteTematica: (id: number) => api.delete(`/tematicas/${id}`),
};
