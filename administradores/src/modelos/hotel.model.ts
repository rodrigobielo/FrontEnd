import { Ciudad } from './ciudad.model';
import { Categoria } from './categoria.model';
import { Habitacion } from './habitacion.model';

export interface Hotel {
  id: number;
  nombre: string;
  descripcion: string;
  correo: string;
  telefono: string;
  contactos?: string;
  precio?: number;
  ciudades: Ciudad | null;
  categorias: Categoria | null;
  habitaciones: Habitacion[];
}

// Tipo para crear hotel (sin ID)
export interface HotelCreate {
  nombre: string;
  descripcion: string;
  correo: string;
  telefono: string;
  contactos?: string;
  precio?: number;
  ciudadId: number;
  categoriaId: number;
}

// Versión simplificada para formulario
export interface HotelFormData {
  nombre: string;
  descripcion: string;
  correo: string;
  telefono: string;
  contactos: string;
  precio: number | null;
  ciudadId: number | null;
  categoriaId: number | null;
}

// Función de utilidad para crear objeto Hotel vacío
export function createEmptyHotel(): Omit<Hotel, 'id'> {
  return {
    nombre: '',
    descripcion: '',
    correo: '',
    telefono: '',
    contactos: '',
    precio: 0,
    ciudades: null,
    categorias: null,
    habitaciones: []
  };
}