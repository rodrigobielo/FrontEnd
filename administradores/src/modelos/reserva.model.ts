export interface Reserva {
  id?: number;
  fechaReserva: Date;
  fechaEntrada: Date;
  fechaSalida: Date;
  numeroHuespedes: number;
  precioTotal: number;
  pedidoEspecial?: string;
  estadoReserva: string;
  codigo: string;
  habitacion?: {
    id?: number;
    numero?: string;
    tipo?: string;
    hotel?: {
      id?: number;
      nombre?: string;
    };
  };
  usuario?: {
    id?: number;
    nombre?: string;
    email?: string;
  };
}

// Estados posibles de reserva
export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
  RECHAZADA: 'rechazada',
  PAGADA: 'pagada'
};

// Función de utilidad
export function createEmptyReserva(): Reserva {
  return {
    fechaReserva: new Date(),
    fechaEntrada: new Date(),
    fechaSalida: new Date(),
    numeroHuespedes: 1,
    precioTotal: 0,
    estadoReserva: ESTADOS_RESERVA.PENDIENTE,
    codigo: '',
    pedidoEspecial: ''
  };
}