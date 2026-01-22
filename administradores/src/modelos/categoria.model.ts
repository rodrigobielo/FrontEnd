export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  numeroEstrellas?: number; // Propiedad opcional
}

export interface CategoriaDTO {
  nombre: string;
  descripcion?: string;
  numeroEstrellas?: number;
}