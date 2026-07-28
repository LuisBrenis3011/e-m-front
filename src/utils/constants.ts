export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const ESTADOS_EVENTO = [
  { value: 'PROGRAMADO', label: 'Programado', color: '#3B82F6' },
  { value: 'CONFIRMADO', label: 'Confirmado', color: '#10B981' },
  { value: 'COMPLETADO', label: 'Completado', color: '#6B7280' },
  { value: 'CANCELADO', label: 'Cancelado', color: '#EF4444' },
] as const;

export const ESTADOS_CONTRATO = [
  { value: 'BORRADOR', label: 'Borrador', color: '#9CA3AF' },
  { value: 'PENDIENTE', label: 'Pendiente', color: '#F59E0B' },
  { value: 'CONFIRMADO', label: 'Confirmado', color: '#10B981' },
  { value: 'COMPLETADO', label: 'Completado', color: '#6B7280' },
  { value: 'CANCELADO', label: 'Cancelado', color: '#EF4444' },
] as const;

export const TIPOS_PAGO = [
  { value: 'ADELANTO', label: 'Adelanto' },
  { value: 'SALDO', label: 'Saldo' },
  { value: 'PAGO_TOTAL', label: 'Pago Total' },
] as const;

export const METODOS_PAGO = [
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'EFECTIVO', label: 'Efectivo' },
] as const;

export const TIPOS_PLANTILLA = [
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'COTIZACION', label: 'Cotización' },
  { value: 'PROFORMA', label: 'Proforma' },
] as const;

export const COLORES_CALENDARIO = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
] as const;
