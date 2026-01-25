import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8765/';

  constructor(private http: HttpClient) { }

  // Método de login
  login(credentials: any): Observable<any> {
    const loginData = {
      email: credentials.email,
      contrasena: credentials.contrasena
    };
    
    return this.http.post<any>(`${this.apiUrl}auth/login`, loginData)
      .pipe(
        map(response => {
          if (response.success) {
            return {
              token: response.token,
              usuario: response.usuario,
              mensaje: response.message,
              success: true
            };
          } else {
            throw { 
              status: 401, 
              message: response.message || 'Credenciales inválidas'
            };
          }
        }),
        catchError(this.handleError)
      );
  }

  // Método para verificar conexión
  verificarConexion(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Otros métodos CRUD para usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(catchError(this.handleError));
  }

  // ... otros métodos ...

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ApiService:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión con el servidor';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = error.error?.message || 'No autorizado';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    // Devuelve un observable que emite un error
    return throwError(() => ({ 
      status: error.status, 
      message: errorMessage
    }));
  }
}