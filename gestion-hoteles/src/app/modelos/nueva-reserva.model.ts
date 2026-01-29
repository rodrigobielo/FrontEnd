// Archivo: src/app/modelos/nueva-reserva.model.ts

// Interfaz para Reserva según la entidad del backend
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

// Interfaz para respuesta de reserva creada
export interface ReservaResponse {
  id: number;
  fechaReserva: string;
  fechaEntrada: string;
  fechaSalida: string;
  numeroHuespedes: number;
  precioTotal: number;
  pedidoEspecial: string;
  estadoReserva: string;
  codigo: string;
  habitaciones: {
    id: number;
    tipo: string;
    numero: string;
    precioPorNoche: number;
    disponible: boolean;
  };
  usuarios?: {
    id: number;
    nombre: string;
    email: string;
  };
}

// Interfaces para hoteles y habitaciones
export interface Habitacion {
  id: number;
  tipo: string;
  numero: string;
  descripcion: string;
  capacidad: number;
  precioPorNoche: number;
  disponible: boolean;
  hotelId: number;
}

export interface Hotel {
  id: number;
  nombre: string;
  ubicacion: string;
  categoria: number;
  descripcion: string;
  activo: boolean;
  habitaciones?: Habitacion[];
}