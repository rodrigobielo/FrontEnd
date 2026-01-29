export interface Reserva {
  id?: number;
  fechaReserva?: string;     // Cambiado de fechaCreacion
  fechaEntrada: string;      // Cambiado de fechaInicio
  fechaSalida: string;       // Cambiado de fechaFin
  numeroHuespedes: number;   // Cambiado de personas
  precioTotal: number;       // Cambiado de total
  pedidoEspecial?: string;   // Cambiado de observaciones
  estadoReserva: string;     // Cambiado de estado
  codigo?: string;
  habitaciones: {
    id: number;
  };
  usuarios?: {
    id: number;
  };
}

export interface ReservaDetallada extends Reserva {
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
  hotel?: {
    id: number;
    nombre: string;
    ubicacion: string;
  };
  habitacion?: {
    id: number;
    tipo: string;
    capacidad: number;
    precioPorNoche: number;
  };
}

export interface ReservaRequest {
  fechaEntrada: string;
  fechaSalida: string;
  numeroHuespedes: number;
  pedidoEspecial?: string;
  precioTotal: number;
  estadoReserva: string;
  habitaciones: {
    id: number;
  };
  usuarios?: {
    id: number;
  };
}

export interface ReservaResponse {
  success: boolean;
  message: string;
  reserva?: ReservaDetallada;
  reservas?: ReservaDetallada[];
}