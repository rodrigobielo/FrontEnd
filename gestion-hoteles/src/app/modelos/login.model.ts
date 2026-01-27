// login.model.ts

export interface Credenciales {
  email: string;
  contrasena: string;
}

export interface RespuestaLogin {
  success: boolean;
  message: string;
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  rol: string;
  username: string;
}