// Si existe rol.model.ts, cambiar su contenido a:
export interface Rol {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface RolSimple {
  id: number;
  nombre: string;
}

// Si el archivo no existe, créalo con este contenido