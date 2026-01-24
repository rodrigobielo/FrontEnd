export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  rol: string;
  username: string;
  hotelId?: number; // Para adminHotel, almacenar ID del hotel
}