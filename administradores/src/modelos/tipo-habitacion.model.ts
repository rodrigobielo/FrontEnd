export interface TipoHabitacion {
  id?: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  aireAcondicionador: boolean;
  minibar: boolean;
  television: boolean;
  numeroCamas: number;
}

// Función de utilidad para crear objeto TipoHabitacion vacío
export function createEmptyTipoHabitacion(): TipoHabitacion {
  return {
    nombre: '',
    descripcion: '',
    capacidad: 1,
    aireAcondicionador: false,
    minibar: false,
    television: false,
    numeroCamas: 1
  };
}

// Interface para formulario
export interface TipoHabitacionFormData {
  nombre: string;
  descripcion: string;
  capacidad: number;
  aireAcondicionador: boolean;
  minibar: boolean;
  television: boolean;
  numeroCamas: number;
}