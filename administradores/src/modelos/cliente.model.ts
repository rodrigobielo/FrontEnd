// modelos/cliente.model.ts

export interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  usuario: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  direccion?: string;
  contrasena?: string;
  rol?: Rol;
  rolId?: number;
  fechaRegistro?: Date;
  ultimaActividad?: Date;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface ReservaCliente {
  id: number;
  codigo: string;
  fechaReserva: Date;
  fechaEntrada: Date;
  fechaSalida: Date;
  numeroHuespedes: number;
  precioTotal: number;
  pedidoEspecial: string;
  estadoReserva: string;
  hotel: HotelInfo | null,
  habitacion: HabitacionInfo;
  pagos: PagoInfo[];
}

export interface HotelInfo {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface HabitacionInfo {
  id: number;
  numero: string;
  tipo: string;
  precioNoche: number;
  capacidad: number;
}

export interface PagoInfo {
  id: number;
  monto: number;
  fechaPago: Date;
  metodoPago: string;
  estado: string;
  referencia: string;
}

export interface ClienteEstadisticas {
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasPagadas: number;
  reservasCanceladas: number;
  nochesTotales: number;
  habitacionesFavoritas: string[];
  hotelesVisitados: number;
  promedioGasto: number;
  ultimoCheckIn: Date | null;
  ultimoCheckOut: Date | null;
}

export interface ClienteConDetalles extends Cliente {
  reservas: ReservaCliente[];
  totalReservas: number;
  totalGastado: number;
  ultimaReserva: Date;
  estado: string;
  estadisticas: ClienteEstadisticas;
}

export interface ClienteFiltro {
  nombre?: string;
  email?: string;
  telefono?: string;
  documento?: string;
  hotelId?: number;
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  pagina?: number;
  limite?: number;
}

export interface ClienteResponse {
  data: ClienteConDetalles[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Constantes de estados de cliente
export const ESTADOS_CLIENTE = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  EN_CURSO: 'en_curso',
  PROXIMO: 'proximo',
  FINALIZADO: 'finalizado',
  PENDIENTE: 'pendiente'
} as const;

export type EstadoCliente = typeof ESTADOS_CLIENTE[keyof typeof ESTADOS_CLIENTE];

// Helper para obtener nombre completo
export function getNombreCompleto(cliente: Cliente): string {
  return `${cliente.nombre} ${cliente.apellidos}`.trim();
}