// src/modelos/region.model.ts
export interface Region {
  id: number;        // Long en Java -> number en TS
  nombre: string;    // nombreRegion en Java
  descripcion: string; // descrpcionRegion en Java
  codigo?: string;
  fechaCreacion?: string; // String en Java -> string en TS
}

// Para formularios (creación/edición)
export interface RegionForm {
  id?: number;
  nombre: string;
  descripcion: string;
  codigo?: string;
}