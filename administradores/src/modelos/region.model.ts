export interface Region {
  id: number;  // Cambiar a obligatorio
  nombre: string;
  descripcion: string;
  codigo?: string;  // Solo para frontend
  fechaCreacion?: Date;
}

// O si prefieres mantenerlo opcional para nuevos registros:
export interface RegionForm {
  id?: number;
  nombre: string;
  descripcion: string;
  codigo?: string;
}