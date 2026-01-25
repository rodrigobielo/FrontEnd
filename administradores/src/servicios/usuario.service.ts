import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario, UsuarioDTO } from '../modelos/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8765/Usuarios';

  constructor(private http: HttpClient) { }

  private transformUsuarioResponse(data: any): Usuario {
    console.log('Transformando respuesta de usuario:', data);
    
    return {
      id: data.id || 0,
      nombre: data.nombre || '',
      apellidos: data.apellidos || '',
      telefono: data.telefono || '',
      nacionalidad: data.nacionalidad || '',
      numPasaporte: data.numPasaporte || '',
      contrasena: data.contrasena || '',
      usuario: data.usuario || '',
      email: data.email || '',
      rolId: data.roles ? data.roles.id : (data.rolId || 0)
    };
  }

  // Métodos principales
  getAll(): Observable<Usuario[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Listar`).pipe(
      map(usuarios => {
        console.log('Respuesta cruda de usuarios:', usuarios);
        return usuarios.map(usuario => this.transformUsuarioResponse(usuario));
      }),
      catchError((error: any) => {
        console.error('Error obteniendo usuarios:', error);
        // Datos mock de ejemplo
        return of([
          { 
            id: 1, 
            nombre: 'Juan', 
            apellidos: 'Pérez García', 
            telefono: '+34 600 123 456',
            nacionalidad: 'Española',
            numPasaporte: 'AB1234567',
            contrasena: 'password123',
            usuario: 'juan.perez',
            email: 'juan.perez@example.com',
            rolId: 1
          },
          { 
            id: 2, 
            nombre: 'María', 
            apellidos: 'González López', 
            telefono: '+34 699 987 654',
            nacionalidad: 'Mexicana',
            numPasaporte: 'MX8765432',
            contrasena: 'password456',
            usuario: 'maria.gonzalez',
            email: 'maria.gonzalez@example.com',
            rolId: 2
          }
        ]);
      })
    );
  }

  // MÉTODOS DE COMPATIBILIDAD (para resolver los errores)
  getUsuarios(): Observable<Usuario[]> {
    return this.getAll();
  }

  createUsuario(usuario: UsuarioDTO): Observable<Usuario> {
    return this.create(usuario);
  }

  // Resto de métodos
  getById(id: number): Observable<Usuario> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(usuario => this.transformUsuarioResponse(usuario))
    );
  }

  create(usuario: UsuarioDTO): Observable<Usuario> {
    const usuarioBackend = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      roles: { id: usuario.rolId }
    };
    
    console.log('Enviando usuario al backend:', usuarioBackend);
    
    return this.http.post<any>(`${this.apiUrl}/Crear`, usuarioBackend).pipe(
      map(usuario => this.transformUsuarioResponse(usuario))
    );
  }

  update(id: number, usuario: UsuarioDTO): Observable<Usuario> {
    const usuarioBackend = {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      roles: { id: usuario.rolId }
    };
    
    console.log('Actualizando usuario:', usuarioBackend);
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuarioBackend).pipe(
      map(usuario => this.transformUsuarioResponse(usuario))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Métodos adicionales útiles
  getUsuariosPorRol(rolId: number): Observable<Usuario[]> {
    return this.getAll().pipe(
      map(usuarios => usuarios.filter(usuario => usuario.rolId === rolId))
    );
  }

  buscarPorEmail(email: string): Observable<Usuario | null> {
    return this.getAll().pipe(
      map(usuarios => usuarios.find(usuario => usuario.email === email) || null)
    );
  }

  buscarPorUsuario(username: string): Observable<Usuario | null> {
    return this.getAll().pipe(
      map(usuarios => usuarios.find(usuario => usuario.usuario === username) || null)
    );
  }
}