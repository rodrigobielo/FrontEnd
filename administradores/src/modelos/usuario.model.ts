export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  rolId: number;
}

export interface UsuarioDTO {
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  rolId: number;
}