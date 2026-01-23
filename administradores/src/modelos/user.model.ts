export interface User {
  id?: number;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  nacionalidad?: string;
  numPasaporte?: string;
  rol: string;
  // Campos opcionales para compatibilidad
  username?: string;
  email?: string;
}