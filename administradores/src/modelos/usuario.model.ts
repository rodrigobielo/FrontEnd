import { Roles } from './roles.model';
import { Reserva } from './reserva.model';
import { Hotel } from './hotel.model';

export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  reservas?: Reserva[];
  hoteles?: Hotel[];
  roles?: Roles;
}

// Versión simplificada para formulario
export interface UsuarioFormData {
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  rolId: number | null;
}

// Función de utilidad para crear objeto Usuario vacío
export function createEmptyUsuario(): Usuario {
  return {
    nombre: '',
    apellidos: '',
    telefono: '',
    nacionalidad: '',
    numPasaporte: '',
    contrasena: '',
    usuario: '',
    email: ''
  };
}

// Función de utilidad para crear datos de formulario vacíos
export function createEmptyUsuarioForm(): UsuarioFormData {
  return {
    nombre: '',
    apellidos: '',
    telefono: '',
    nacionalidad: '',
    numPasaporte: '',
    contrasena: '',
    usuario: '',
    email: '',
    rolId: null
  };
}