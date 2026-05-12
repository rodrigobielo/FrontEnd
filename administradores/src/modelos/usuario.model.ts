// usuario.model.ts - VERSIÓN COMPLETA Y CORREGIDA

// ==================== INTERFACES PRINCIPALES ====================

// Interfaz principal de Usuario
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
  roles?: Roles;
  empleado?: Empleado;  // Usa undefined, no null
}

// Interfaz para Roles
export interface Roles {
  id: number;
  nombre: string;
}

// Interfaz para Empleado
export interface Empleado {
  idEmpleado?: number;
  rolEmpleado?: string;
  hotel?: Hotel;
}

// Interfaz para Hotel
export interface Hotel {
  id: number;
  nombre: string;
  descripcion?: string;
  correo?: string;
  telefono?: string;
  contactos?: string;
  precio?: number;
  ciudades?: any;
  categorias?: any;
}

// ==================== INTERFACES PARA SOLICITUDES (REQUEST) ====================

// Interfaz para crear usuario normal (sin empleado)
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

// Interfaz para crear usuario como empleado
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
  rolId?: number | null;
  rolEmpleado?: string | null;
}

// Interfaz para actualizar usuario empleado
export interface UsuarioEmpleadoUpdate {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  nacionalidad?: string;
  numPasaporte?: string;
  contrasena?: string;
  usuario?: string;
  email?: string;
  rolId?: number | null;
  hotelId?: number | null;
  rolEmpleado?: string | null;
}

// ==================== INTERFACES PARA RESPUESTAS (RESPONSE) ====================

// Interfaz para respuesta del backend (usuario normal)
export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  usuario: string;
  email: string;
  roles?: Roles;
  empleado?: Empleado;
}

// Interfaz para respuesta de usuario empleado (versión antigua)
export interface UsuarioEmpleadoResponse {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  usuario: string;
  email: string;
  hotel: Hotel;
  rolEmpleado?: string;
  roles?: Roles;
}

// Interfaz para respuesta completa del backend (UsuarioEmpleadoResponseDTO)
export interface UsuarioCompletoResponse {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  usuario: string;
  email: string;
  idEmpleado: number | null;
  idHotel: number | null;
  nombreHotel: string | null;
  rolEmpleado: string | null;
  mensaje: string;
}

// Interfaz para la respuesta de lista de usuarios
export interface UsuariosPageResponse {
  usuarios: UsuarioCompletoResponse[];
  total: number;
  mensaje: string;
}

// ==================== INTERFACES PARA FORMULARIOS ====================

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

export interface EmpleadoFormData {
  hotelId: number | null;
  rolEmpleado: string;
}

// ==================== FUNCIONES AUXILIARES ====================

// Función auxiliar para convertir null a undefined
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// ==================== FUNCIONES PARA CREAR OBJETOS VACÍOS ====================

export function createEmptyUsuario(): UsuarioCreate {
  return {
    nombre: '',
    apellidos: '',
    telefono: '',
    nacionalidad: '',
    numPasaporte: '',
    contrasena: '',
    usuario: '',
    email: '',
    rolId: undefined
  };
}

export function createEmptyEmpleadoForm(): EmpleadoFormData {
  return {
    hotelId: null,
    rolEmpleado: ''
  };
}

export function createEmptyUsuarioEmpleado(): UsuarioEmpleadoCreate {
  return {
    nombre: '',
    apellidos: '',
    telefono: '',
    nacionalidad: '',
    numPasaporte: '',
    contrasena: '',
    usuario: '',
    email: '',
    hotelId: 0,
    rolId: null,
    rolEmpleado: null
  };
}

export function createEmptyUsuarioFormData(): UsuarioFormData {
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

export function createEmptyUsuarioObject(): Usuario {
  return {
    nombre: '',
    apellidos: '',
    telefono: '',
    nacionalidad: '',
    numPasaporte: '',
    contrasena: '',
    usuario: '',
    email: '',
    roles: undefined,
    empleado: undefined
  };
}

// ==================== FUNCIONES DE MAPEO (RESPUESTA -> OBJETO) ====================

// Función para mapear UsuarioCompletoResponse a Usuario
export function mapCompletoToUsuario(completo: UsuarioCompletoResponse): Usuario {
  // Convertir null a undefined
  const idEmpleado = nullToUndefined(completo.idEmpleado);
  const idHotel = nullToUndefined(completo.idHotel);
  const nombreHotel = nullToUndefined(completo.nombreHotel);
  const rolEmpleado = nullToUndefined(completo.rolEmpleado);
  
  let empleado: Empleado | undefined = undefined;
  
  if (idEmpleado !== undefined) {
    let hotel: Hotel | undefined = undefined;
    
    if (idHotel !== undefined) {
      hotel = {
        id: idHotel,
        nombre: nombreHotel || '',
        descripcion: undefined,
        correo: undefined,
        telefono: undefined,
        contactos: undefined,
        precio: undefined,
        ciudades: undefined,
        categorias: undefined
      };
    }
    
    empleado = {
      idEmpleado: idEmpleado,
      rolEmpleado: rolEmpleado,
      hotel: hotel
    };
  }
  
  return {
    id: completo.idUsuario,
    nombre: completo.nombre,
    apellidos: completo.apellidos,
    telefono: completo.telefono,
    nacionalidad: completo.nacionalidad,
    numPasaporte: completo.numPasaporte,
    contrasena: '',
    usuario: completo.usuario,
    email: completo.email,
    roles: undefined,
    empleado: empleado
  };
}

// Función para mapear respuesta a Usuario (legacy)
export function mapToUsuario(response: any): Usuario {
  return {
    id: response.id,
    nombre: response.nombre,
    apellidos: response.apellidos,
    telefono: response.telefono,
    nacionalidad: response.nacionalidad,
    numPasaporte: response.numPasaporte,
    contrasena: response.contrasena || '',
    usuario: response.usuario,
    email: response.email,
    roles: response.roles,
    empleado: response.empleado ? {
      idEmpleado: response.empleado.idEmpleado,
      rolEmpleado: response.empleado.rolEmpleado,
      hotel: response.empleado.hotel
    } : undefined
  };
}

// Función para mapear respuesta a UsuarioEmpleadoResponse
export function mapToUsuarioEmpleadoResponse(response: any): UsuarioEmpleadoResponse {
  return {
    id: response.id,
    nombre: response.nombre,
    apellidos: response.apellidos,
    telefono: response.telefono,
    nacionalidad: response.nacionalidad,
    numPasaporte: response.numPasaporte,
    usuario: response.usuario,
    email: response.email,
    hotel: response.hotel,
    rolEmpleado: response.rolEmpleado,
    roles: response.roles
  };
}

// Función para mapear respuesta a UsuarioCompletoResponse
export function mapToUsuarioCompleto(response: any): UsuarioCompletoResponse {
  return {
    idUsuario: response.idUsuario || response.id,
    nombre: response.nombre,
    apellidos: response.apellidos,
    telefono: response.telefono,
    nacionalidad: response.nacionalidad,
    numPasaporte: response.numPasaporte,
    usuario: response.usuario,
    email: response.email,
    idEmpleado: response.idEmpleado !== undefined ? response.idEmpleado : null,
    idHotel: response.idHotel !== undefined ? response.idHotel : null,
    nombreHotel: response.nombreHotel !== undefined ? response.nombreHotel : null,
    rolEmpleado: response.rolEmpleado !== undefined ? response.rolEmpleado : null,
    mensaje: response.mensaje || ''
  };
}

// ==================== FUNCIONES DE MAPEO (OBJETO -> SOLICITUD) ====================

export function mapUsuarioToCreate(usuario: Usuario): UsuarioCreate {
  return {
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono,
    nacionalidad: usuario.nacionalidad,
    numPasaporte: usuario.numPasaporte,
    contrasena: usuario.contrasena,
    usuario: usuario.usuario,
    email: usuario.email,
    rolId: usuario.roles?.id
  };
}

export function mapUsuarioToEmpleadoCreate(
  usuario: Usuario, 
  hotelId: number, 
  rolEmpleado?: string
): UsuarioEmpleadoCreate {
  return {
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    telefono: usuario.telefono,
    nacionalidad: usuario.nacionalidad,
    numPasaporte: usuario.numPasaporte,
    contrasena: usuario.contrasena,
    usuario: usuario.usuario,
    email: usuario.email,
    hotelId: hotelId,
    rolId: usuario.roles?.id,
    rolEmpleado: rolEmpleado || null
  };
}

// ==================== FUNCIONES DE LIMPIEZA Y PREPARACIÓN ====================

export function cleanNullValues<T>(obj: T): T {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned as T;
}

export function prepareUsuarioEmpleadoForBackend(data: any): any {
  const prepared: any = {
    nombre: data.nombre?.trim(),
    apellidos: data.apellidos?.trim(),
    telefono: data.telefono?.trim(),
    nacionalidad: data.nacionalidad?.trim(),
    numPasaporte: data.numPasaporte?.trim(),
    contrasena: data.contrasena,
    usuario: data.usuario?.trim().toLowerCase(),
    email: data.email?.trim().toLowerCase(),
    hotelId: data.hotelId
  };
  
  if (data.rolId !== null && data.rolId !== undefined && data.rolId !== '') {
    prepared.rolId = Number(data.rolId);
  }
  
  if (data.rolEmpleado !== null && data.rolEmpleado !== undefined && data.rolEmpleado !== '') {
    prepared.rolEmpleado = data.rolEmpleado.trim();
  }
  
  return prepared;
}

// ==================== FUNCIONES DE VALIDACIÓN Y UTILIDADES ====================

export function isUsuarioEmpleado(usuario: Usuario): boolean {
  return !!(usuario.empleado && usuario.empleado.idEmpleado);
}

export function isUsuarioEmpleadoFromCompleto(completo: UsuarioCompletoResponse): boolean {
  return completo.idEmpleado !== null && completo.idEmpleado !== undefined;
}

export function getHotelNombre(usuario: Usuario): string {
  if (usuario.empleado?.hotel?.nombre) {
    return usuario.empleado.hotel.nombre;
  }
  return 'Sin hotel asignado';
}

export function getHotelNombreFromCompleto(completo: UsuarioCompletoResponse): string {
  if (completo.nombreHotel) {
    return completo.nombreHotel;
  }
  return 'Sin hotel asignado';
}

export function getRolEmpleado(usuario: Usuario): string {
  if (usuario.empleado?.rolEmpleado) {
    return usuario.empleado.rolEmpleado;
  }
  return 'No especificado';
}

export function getRolEmpleadoFromCompleto(completo: UsuarioCompletoResponse): string {
  if (completo.rolEmpleado) {
    return completo.rolEmpleado;
  }
  return 'No especificado';
}

export function getHotelId(usuario: Usuario): number | undefined {
  if (usuario.empleado?.hotel?.id) {
    return usuario.empleado.hotel.id;
  }
  return undefined;
}

export function getHotelIdFromCompleto(completo: UsuarioCompletoResponse): number | null {
  return completo.idHotel;
}

export function getNombreCompleto(usuario: Usuario): string {
  return `${usuario.nombre} ${usuario.apellidos}`;
}

export function getNombreCompletoFromCompleto(completo: UsuarioCompletoResponse): string {
  return `${completo.nombre} ${completo.apellidos}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidTelefono(telefono: string): boolean {
  const telefonoRegex = /^[+\d\s-]{8,20}$/;
  return telefonoRegex.test(telefono);
}

export function isValidPassword(contrasena: string): boolean {
  return contrasena.length >= 6;
}