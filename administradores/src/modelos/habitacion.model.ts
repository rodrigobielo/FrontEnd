export interface Habitacion {
  id?: number;
  precioNoche: number;
  disponibilidad: boolean;
  caracteristicas: string;
  hoteles?: {
    id?: number;
    nombre?: string;
    ciudades?: {
      id?: number;
      nombre?: string;
    };
  };
  tiposHabitaciones?: {
    id?: number;
    nombre?: string;
    capacidad?: number;
    aireAcondicionador?: boolean;
    minibar?: boolean;
    television?: boolean;
  };
  // Propiedades adicionales para el servicio de reservas
  numero?: string;
  tipo?: string;
  descripcion?: string;
  disponible?: boolean;
  hotelId?: number;
  hotel?: {
    id?: number;
    nombre?: string;
  };
}

// Interfaz para el formulario de habitación
export interface HabitacionFormData {
  precioNoche: number;
  disponibilidad: boolean;
  caracteristicas: string;
  hotelId: number;
  tipoHabitacionId: number;
}

// Función de utilidad
export function createEmptyHabitacion(): Habitacion {
  return {
    precioNoche: 0,
    disponibilidad: true,
    caracteristicas: '',
    numero: '',
    tipo: '',
    disponible: true
  };
}