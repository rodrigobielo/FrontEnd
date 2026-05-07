// Modelo completo que coincide con el backend
export interface Region {
  id: number;
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  fechaCreacion?: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  regiones: Region | null;  // Puede ser null si no tiene región
  ciudades?: any[];  // Opcional, para cuando se necesiten las ciudades
}

// Interfaz para enviar al backend (solo IDs)
export interface ProvinciaBackend {
  nombre: string;
  regiones: {
    id: number;
  };
}

// Interfaz simplificada para dropdowns
export interface ProvinciaSimple {
  id: number;
  nombre: string;
}

// Función para crear una provincia vacía
export function createEmptyProvincia(): Provincia {
  return {
    id: 0,
    nombre: '',
    regiones: null,
    ciudades: []
  };
}