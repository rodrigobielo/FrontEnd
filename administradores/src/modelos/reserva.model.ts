export interface Reserva {
  id?: number;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
  total: number;
  observaciones?: string;
}

// Función de utilidad
export function createEmptyReserva(): Reserva {
  return {
    fechaInicio: new Date(),
    fechaFin: new Date(),
    estado: 'pendiente',
    total: 0,
    observaciones: ''
  };
}