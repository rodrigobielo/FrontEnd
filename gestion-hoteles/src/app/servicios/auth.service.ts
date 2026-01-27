import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz para las credenciales
export interface Credenciales {
  email: string;
  contrasena: string;
}

// Interfaz para la respuesta del login
export interface RespuestaLogin {
  success: boolean;
  message: string;
  token: string;
  usuario: Usuario;
}

// Interfaz para el usuario
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  rol: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8765/auth';
  private usuarioKey = 'usuarioTurismo';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  login(credenciales: Credenciales): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(
      `${this.apiUrl}/login`,
      credenciales,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  isAuthenticated(): boolean {
    return this.getUsuarioActual() !== null;
  }

  getUsuarioActual(): any {
    const usuarioStr = localStorage.getItem(this.usuarioKey);
    if (usuarioStr) {
      try {
        return JSON.parse(usuarioStr);
      } catch (e) {
        console.error('Error parsing usuario from localStorage', e);
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    const usuario = this.getUsuarioActual();
    return usuario ? usuario.token : null;
  }

  getUserInfo(): any {
    const usuario = this.getUsuarioActual();
    return usuario ? {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol: usuario.rol,
      username: usuario.username
    } : null;
  }

  hasRole(role: string): boolean {
    const usuario = this.getUsuarioActual();
    return usuario && usuario.rol === role;
  }

  logout(): void {
    localStorage.removeItem(this.usuarioKey);
  }

  private manejarError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = error.error?.message || 'Credenciales incorrectas';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a este recurso';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}