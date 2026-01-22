// Para completar el componente, necesitarás crear este modelo
export interface Categoria {
  id: number;
  nombre: string;
  numeroEstrellas: number;
  descripcion: string;
}

export interface CategoriaDTO {
  nombre: string;
  numeroEstrellas: number;
  descripcion: string;
}