export interface TipoHabitacion {
  id?: number;
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  comodidades?: string;
}

// Función de utilidad para crear objeto TipoHabitacion vacío
export function createEmptyTipoHabitacion(): TipoHabitacion {
  return {
    nombre: '',
    descripcion: '',
    capacidad: 1,
    comodidades: ''
  };
}