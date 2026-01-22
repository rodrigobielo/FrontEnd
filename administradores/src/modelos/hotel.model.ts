// Importar Imagen para resolver el error
import { Imagen } from './imagen.model';

export interface Hotel {
  id?: number;
  nombre: string;
  descripcion: string;
  contactos: string;
  contrasena: string;
  ciudades?: any;
  categorias?: any;
  ciudadId?: number;
  categoriaId?: number;
  habitaciones?: number;
  precioPromedio?: number;
  fechaCreacion?: Date;
  imagenes?: Imagen[];  // Ahora está correctamente tipado
}