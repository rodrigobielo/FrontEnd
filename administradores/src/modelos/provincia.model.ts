export interface Provincia {
  id: number;
  nombre: string;
  regiones?: {
    id: number;
    nombre?: string;
    descripcion?: string;
    codigo?: string;
    fechaCreacion?: string;
  };
}

export interface ProvinciaBackend {
  nombre: string;
  regiones: {
    id: number;
  };
}

// Nueva interfaz para el dropdown (solo id y nombre)
export interface ProvinciaSimple {
  id: number;
  nombre: string;
}