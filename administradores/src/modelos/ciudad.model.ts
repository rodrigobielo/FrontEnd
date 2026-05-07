// Modelo para la respuesta del backend
export interface Ciudad {
  id: number;
  nombre: string;
  descripcion: string;
  provinciaId: number;
  provincias?: {
    id: number;
    nombre?: string;
  };
}

// DTO para el formulario (simplificado)
export interface CiudadDTO {
  nombre: string;
  descripcion: string;
  provinciaId: number;
}

// Función para crear Ciudad vacía
export function createEmptyCiudad(): Ciudad {
  return {
    id: 0,
    nombre: '',
    descripcion: '',
    provinciaId: 0
  };
}