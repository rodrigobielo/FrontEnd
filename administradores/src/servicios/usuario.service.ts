import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario, UsuarioFormData } from '../modelos/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8765/Usuarios';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/Listar`).pipe(
      map((usuarios: any[]) => usuarios.map(usuario => this.transformUsuario(usuario))),
      catchError(this.handleError)
    );
  }

  // Obtener un usuario por ID
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      map(usuario => this.transformUsuario(usuario)),
      catchError(this.handleError)
    );
  }

  // Crear un nuevo usuario
  create(usuario: UsuarioFormData): Observable<Usuario> {
    const usuarioData = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      roles: usuario.rolId ? { id: usuario.rolId } : null
    };
    return this.http.post<Usuario>(`${this.apiUrl}/Crear`, usuarioData, this.httpOptions).pipe(
      map(usuario => this.transformUsuario(usuario)),
      catchError(this.handleError)
    );
  }

  // Actualizar un usuario existente
  update(id: number, usuario: UsuarioFormData): Observable<Usuario> {
    const usuarioData = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      roles: usuario.rolId ? { id: usuario.rolId } : null
    };
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuarioData, this.httpOptions).pipe(
      map(usuario => this.transformUsuario(usuario)),
      catchError(this.handleError)
    );
  }

  // Eliminar un usuario
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Transformar los datos del usuario para incluir el rolId si es necesario
  private transformUsuario(usuario: any): Usuario {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      roles: usuario.roles || null,
      reservas: usuario.reservas || [],
      hoteles: usuario.hoteles || []
    };
  }

  // Filtrar usuarios por rol
  getUsuariosByRol(rolId: number): Observable<Usuario[]> {
    return this.getUsuarios().pipe(
      map(usuarios => usuarios.filter(usuario => usuario.roles?.id === rolId))
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio Usuario:', error);
    return throwError(() => new Error('Error en el servicio de usuarios'));
  }
}