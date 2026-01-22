export interface Ciudad {
  id: number;
  nombre: string;
  descripcion: string;
  provinciaId: number;
}

export interface CiudadDTO {
  nombre: string;
  descripcion: string;
  provinciaId: number;
}