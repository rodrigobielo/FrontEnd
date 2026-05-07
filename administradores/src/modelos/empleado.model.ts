import { Usuario } from './usuario.model';
import { Hotel } from './hotel.model';

// Modelo completo de Empleado (lo que espera el backend)
export interface Empleado {
  idEmpleado: number;
  usuario: Usuario;
  hotel: Hotel;
}

// Tipo para crear empleado (sin ID, solo las referencias)
export interface EmpleadoCreate {
  usuario: { id: number };
  hotel: { id: number };
}

// Tipo para respuesta del backend (versión simplificada con solo los datos necesarios)
export interface EmpleadoResponse {
  idEmpleado: number;
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    usuario: string;
    email: string;
  };
  hotel: {
    id: number;
    nombre: string;
    descripcion: string;
    telefono: string;
    correo?: string;
  };
}

// Tipo para actualizar empleado
export interface EmpleadoUpdate {
  usuario?: { id: number };
  hotel?: { id: number };
}

// Función de utilidad para crear objeto Empleado vacío (para inicialización)
export function createEmptyEmpleado(): Omit<Empleado, 'idEmpleado'> {
  return {
    usuario: {
      id: 0,
      nombre: '',
      apellidos: '',
      telefono: '',
      nacionalidad: '',
      numPasaporte: '',
      contrasena: '',
      usuario: '',
      email: ''
    },
    hotel: {
      id: 0,
      nombre: '',
      descripcion: '',
      correo: '',
      telefono: '',
      contactos: '',
      precio: 0,
      ciudades: null,
      categorias: null,
      habitaciones: []
    }
  };
}

// Función de utilidad para crear datos de formulario vacíos
export function createEmptyEmpleadoForm() {
  return {
    idUsuario: null as number | null,
    idHotel: null as number | null
  };
}

// Función para validar si un empleado tiene ID
export function hasEmpleadoId(empleado: Empleado | EmpleadoResponse | null | undefined): empleado is Empleado | EmpleadoResponse {
  return empleado !== null && 
         empleado !== undefined && 
         typeof empleado.idEmpleado === 'number' && 
         empleado.idEmpleado > 0;
}

// Función para convertir EmpleadoResponse a Empleado (si necesitas expandir los datos)
export function expandEmpleadoResponse(response: EmpleadoResponse, usuariosCompletos: Usuario[], hotelesCompletos: Hotel[]): Empleado | null {
  const usuarioCompleto = usuariosCompletos.find(u => u.id === response.usuario.id);
  const hotelCompleto = hotelesCompletos.find(h => h.id === response.hotel.id);
  
  if (!usuarioCompleto || !hotelCompleto) {
    return null;
  }
  
  return {
    idEmpleado: response.idEmpleado,
    usuario: usuarioCompleto,
    hotel: hotelCompleto
  };
}

// Función para convertir Empleado a EmpleadoCreate (para enviar al backend)
export function toEmpleadoCreate(empleado: Partial<Empleado>): EmpleadoCreate | null {
  if (!empleado.usuario?.id || !empleado.hotel?.id) {
    return null;
  }
  
  return {
    usuario: { id: empleado.usuario.id },
    hotel: { id: empleado.hotel.id }
  };
}

// Función para validar si un empleado es válido
export function isValidEmpleado(empleado: Partial<Empleado>): boolean {
  return !!(empleado.usuario?.id && 
            empleado.hotel?.id && 
            empleado.usuario.id > 0 && 
            empleado.hotel.id > 0);
}

// Tipo para el estado del formulario de empleado
export interface EmpleadoFormState {
  idUsuario: number | null;
  idHotel: number | null;
  isValid: boolean;
}

// Función para validar el estado del formulario
export function validateEmpleadoForm(formValue: { idUsuario: any; idHotel: any }): EmpleadoFormState {
  const idUsuario = Number(formValue.idUsuario);
  const idHotel = Number(formValue.idHotel);
  
  const isValid = !isNaN(idUsuario) && 
                  !isNaN(idHotel) && 
                  idUsuario > 0 && 
                  idHotel > 0;
  
  return {
    idUsuario: isValid ? idUsuario : null,
    idHotel: isValid ? idHotel : null,
    isValid
  };
}