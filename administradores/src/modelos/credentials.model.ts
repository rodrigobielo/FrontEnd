export interface Credentials {
  nombre: string;       // CAMBIADO: de 'usuario' a 'nombre'
  contrasena: string;   // CAMBIADO: de 'password' a 'contrasena'
  rememberMe?: boolean;
}