import { Hotel } from './hotel.model';

export interface TipoHabitacion {
  id?: number;
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  comodidades?: string;
}

export interface Habitacion {
  id?: number;
  precioNoche: number;
  disponibilidad: boolean;
  caracteristicas: string;
  hoteles: Hotel | null;
  tiposHabitaciones: TipoHabitacion | null;
}

// Versión simplificada para formulario
export interface HabitacionFormData {
  precioNoche: number | null;
  disponibilidad: boolean;
  caracteristicas: string;
  hotelId: number | null;
  tipoHabitacionId: number | null;
}

// Función de utilidad para crear objeto Habitacion vacío
export function createEmptyHabitacion(): Habitacion {
  return {
    precioNoche: 0,
    disponibilidad: true,
    caracteristicas: '',
    hoteles: null,
    tiposHabitaciones: null
  };
}

// Función de utilidad para crear datos de formulario vacíos
export function createEmptyHabitacionForm(): HabitacionFormData {
  return {
    precioNoche: null,
    disponibilidad: true,
    caracteristicas: '',
    hotelId: null,
    tipoHabitacionId: null
  };
}