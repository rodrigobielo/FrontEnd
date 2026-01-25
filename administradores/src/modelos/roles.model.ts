export interface Roles {
  id?: number;
  nombre: string;
  descripcion?: string;
}

// Función de utilidad
export function createEmptyRoles(): Roles {
  return {
    nombre: '',
    descripcion: ''
  };
}