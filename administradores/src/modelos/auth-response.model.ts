import { User } from './user.model';

export interface AuthResponse {
  token: string;
  usuario: User;
  mensaje: string;
  expiracion: number;
}