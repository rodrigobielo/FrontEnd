export interface Provincia {
  id?: number;
  nombre: string;
  regiones?: {
    id: number;
    nombre?: string;
  };
}

export interface ProvinciaBackend {
  nombre: string;
  regiones: {
    id: number;
  };
}