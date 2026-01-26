export class UsuarioRegistro {
  nombre: string;
  apellidos: string;
  telefono: string;
  nacionalidad: string;
  numPasaporte: string;
  contrasena: string;
  usuario: string;
  email: string;
  roles: { id: number };

  constructor() {
    this.nombre = '';
    this.apellidos = '';
    this.telefono = '';
    this.nacionalidad = '';
    this.numPasaporte = '';
    this.contrasena = '';
    this.usuario = '';
    this.email = '';
    this.roles = { id: 3 };
  }
}