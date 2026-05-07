// usuario.model.ts - VERSIÓN COMPLETA
import { Roles } from './roles.model';
import { Reserva } from './reserva.model';
import { Hotel } from './hotel.model';

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
  reservas?: Reserva[];
  hoteles?: Hotel[];
  roles?: Roles;
  empleado?: {
    idEmpleado: number;
    hotel?: {
      id: number;
      nombre: string;
    };
  };
}

// Tipo para crear usuario (sin ID)
export interface UsuarioCreate {
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  rolId?: number;
}

// DTO para crear usuario como empleado
export interface UsuarioEmpleadoCreate {
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  hotelId: number;
}

// DTO para respuesta de usuario empleado
export interface UsuarioEmpleadoResponse {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  usuario: string;
  email: string;
  roles?: Roles;
  hotel?: {
    id: number;
    nombre: string;
  };
  empleado?: {
    idEmpleado: number;
  };
}

// Tipo para respuesta del backend (usuario normal)
export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
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

// Datos específicos para empleado
export interface EmpleadoFormData {
  hotelId: number | null;
}

// Función de utilidad para crear objeto Usuario vacío
export function createEmptyUsuario(): Omit<Usuario, 'id'> {
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

// Función de utilidad para crear datos de formulario vacíos - EXPORTADA
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

// Función para crear datos vacíos de empleado - EXPORTADA
export function createEmptyEmpleadoForm(): EmpleadoFormData {
  return {
    hotelId: null
  };
}

// Función para crear el objeto para enviar al backend
export function createUsuarioEmpleadoRequest(
  usuarioForm: UsuarioFormData, 
  hotelId: number
): UsuarioEmpleadoCreate {
  return {
    nombre: usuarioForm.nombre,
    apellidos: usuarioForm.apellidos,
    telefono: usuarioForm.telefono,
    nacionalidad: usuarioForm.nacionalidad,
    numPasaporte: usuarioForm.numPasaporte,
    contrasena: usuarioForm.contrasena,
    usuario: usuarioForm.usuario,
    email: usuarioForm.email,
    hotelId: hotelId
  };
}

// Función para validar si un usuario tiene ID
export function hasUsuarioId(usuario: Usuario | null | undefined): usuario is Usuario {
  return usuario !== null && usuario !== undefined && typeof usuario.id === 'number' && usuario.id > 0;
}

// Función para convertir UsuarioEmpleadoResponse a Usuario
export function responseToUsuario(response: UsuarioEmpleadoResponse): Usuario {
  return {
    id: response.id,
    nombre: response.nombre,
    apellidos: response.apellidos,
    telefono: response.telefono,
    nacionalidad: response.nacionalidad,
    numPasaporte: response.numPasaporte,
    contrasena: '',
    usuario: response.usuario,
    email: response.email,
    roles: response.roles,
    empleado: response.empleado ? {
      idEmpleado: response.empleado.idEmpleado,
      hotel: response.hotel
    } : undefined
  };
}