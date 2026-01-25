import { Ciudad } from './ciudad.model';
import { Categoria } from './categoria.model';
import { Usuario } from './usuario.model';
import { Habitacion } from './habitacion.model';

export interface Hotel {
  id?: number;
  nombre: string;
  descripcion: string;
  contactos: string;
  precio: number;
  ciudades: Ciudad | null;
  categorias: Categoria | null;
  usuarios: Usuario | null;
  habitaciones: Habitacion[];
}

// Versión simplificada para formulario
export interface HotelFormData {
  nombre: string;
  descripcion: string;
  contactos: string;
  precio: number | null;
  ciudadId: number | null;
  categoriaId: number | null;
  administradorId: number | null;
}

// Función de utilidad para crear objeto Hotel vacío
export function createEmptyHotel(): Hotel {
  return {
    nombre: '',
    descripcion: '',
    contactos: '',
    precio: 0,
    ciudades: null,
    categorias: null,
    usuarios: null,
    habitaciones: []
  };
}

// Función de utilidad para crear datos de formulario vacíos
export function createEmptyHotelForm(): HotelFormData {
  return {
    nombre: '',
    descripcion: '',
    contactos: '',
    precio: null,
    ciudadId: null,
    categoriaId: null,
    administradorId: null
  };
}