export type Rol = 'PROVEEDOR';

export type EstadoEvento =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'COMPLETADO'
  | 'CANCELADO';

export type EstadoContrato =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'COMPLETADO'
  | 'CANCELADO';

export type EstadoInventario = 'ACTIVO' | 'INACTIVO';

export type EstadoPaquete = 'ACTIVO' | 'INACTIVO';

export type TipoEvento = 'SHOW INFANTIL' | 'HORA LOCA' | string;

export type TipoPago = 'ADELANTO' | 'SALDO' | 'PAGO_TOTAL';

export type MetodoPago =
  | 'YAPE'
  | 'PLIN'
  | 'TRANSFERENCIA'
  | 'EFECTIVO';

export type TipoPlantilla = 'CONTRATO' | 'COTIZACION' | 'PROFORMA';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  errors?: Record<string, string>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  telefono: string;
  nombreEmpresa: string;
  ruc: string;
  nombreGerente: string;
  direccion: string;
  telefonoEmpresa: string;
}

export interface JwtResponse {
  token: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  proveedorId: number;
}

export interface Proveedor {
  id: number;
  nombreEmpresa: string;
  ruc: string;
  nombreGerente: string;
  logoUrl: string | null;
  telefono: string;
  email: string;
  direccion: string | null;
  telefonoEmpresa: string | null;
  terminosCondiciones: string | null;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  proveedorId: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Tematica {
  id: number;
  nombre: string;
  imagenReferencial: string | null;
}

export interface Cliente {
  id: number;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  direccion: string;
  referencia: string;
  email: string;
  fechaRegistro: string;
}

export interface ClienteRequest {
  nombreCompleto: string;
  dni: string;
  telefono: string;
  direccion: string;
  referencia: string;
  email: string;
}

export interface Inventario {
  id: number;
  nombre: string;
  descripcion: string;
  cantidadDisponible: number;
  precioReferencial: number;
  estado: EstadoInventario;
}

export interface InventarioRequest {
  nombre: string;
  descripcion: string;
  cantidadDisponible: number;
  precioReferencial: number;
}

export interface PaqueteDetalleRequest {
  inventarioId: number;
  cantidadIncluida: number;
  precioUnitario: number;
  esObsequio: boolean;
}

export interface PaqueteDetalle {
  id: number;
  inventarioId: number;
  inventarioNombre: string;
  cantidadIncluida: number;
  precioUnitario: number;
  esObsequio: boolean;
}

export interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  tematicaId: number;
  tematicaNombre: string;
  precioBase: number;
  duracionBaseHoras: number;
  detalles: PaqueteDetalle[];
  estado: EstadoPaquete;
}

export interface PaqueteRequest {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  tematicaId: number;
  precioBase: number;
  duracionBaseHoras: number;
  detalles: PaqueteDetalleRequest[];
}

export interface Evento {
  id: number;
  clienteId: number;
  clienteNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  tematicaId: number | null;
  tematicaNombre: string | null;
  tipoEvento: string;
  nombreCumpleanero: string;
  edadCumpleanero: number;
  fechaEvento: string;
  horaInicio: string;
  horaFinEstimada: string;
  direccion: string;
  referencia: string;
  aforoEstimado: number;
  colorCalendario: string;
  notasInternas: string;
  estado: EstadoEvento;
}

export interface EventoRequest {
  clienteId: number;
  categoriaId: number;
  tematicaId?: number | null;
  tipoEvento: string;
  nombreCumpleanero: string;
  edadCumpleanero: number;
  fechaEvento: string;
  horaInicio: string;
  horaFinEstimada?: string;
  direccion: string;
  referencia: string;
  aforoEstimado: number;
  colorCalendario: string;
  notasInternas: string;
}

export interface ContratoDetalle {
  id: number;
  inventarioId: number;
  inventarioNombre: string;
  cantidadIncluida: number;
  precioUnitario: number;
  esObsequio: boolean;
}

export interface Contrato {
  id: number;
  eventoId: number;
  paqueteId: number;
  paqueteNombre: string;
  clienteNombre: string;
  fechaEvento: string;
  costoMovilidad: number;
  montoAdelanto: number;
  montoTotal: number;
  montoPendiente: number;
  duracion: string;
  observaciones: string;
  estado: EstadoContrato;
  detalles: ContratoDetalle[];
}

export interface ContratoRequest {
  eventoId: number;
  paqueteId: number;
  costoMovilidad: number;
  montoAdelanto: number;
  duracion: string;
  observaciones: string;
}

export interface Pago {
  id: number;
  contratoId: number;
  tipoPago: TipoPago;
  monto: number;
  metodoPago: MetodoPago;
  codigoOperacion: string;
  notas: string;
  comprobanteUrl: string | null;
  estado: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
  fechaPago: string;
}

export interface Plantilla {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoPlantilla;
  contenidoHtml: string;
  placeholders: string[];
  esDefault: boolean;
  estado: EstadoInventario;
}

export interface PlantillaRequest {
  nombre: string;
  descripcion: string;
  tipo: TipoPlantilla;
  contenidoHtml: string;
  placeholders: string[];
  esDefault: boolean;
}

export interface Documento {
  id: number;
  contratoId: number;
  plantillaId: number;
  urlPdf: string;
  version: number;
  fechaGeneracion: string;
}

export interface DashboardData {
  totalClientes: number;
  totalInventarioActivo: number;
  totalPaquetesActivos: number;
  totalEventosProgramados: number;
  totalContratos: number;
  contratosPorEstado: Record<string, number>;
  ingresosTotales: number;
  pagosPendientes: number;
  montoPendienteCobrar: number;
  proximosEventos: Evento[];
  eventosDelMes: Evento[];
}

export interface CalendarioQuery {
  inicio: string;
  fin: string;
  page?: number;
  size?: number;
}
