import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  // Prueba con ambos endpoints
  private apiUrl = 'http://localhost:8765/Usuarios';
  
  constructor(private http: HttpClient) { }

  // Método 1: Enviar como normalmente
  registrarUsuario(usuario: any): Observable<any> {
    console.log('Enviando usuario:', JSON.stringify(usuario));
    
    return this.http.post<any>(`${this.apiUrl}/Crear`, usuario)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Método 2: Para debugging
  registrarUsuarioDebug(usuario: any): Observable<any> {
    console.log('Enviando (debug):', JSON.stringify(usuario));
    
    return this.http.post<any>(`${this.apiUrl}/CrearDebug`, usuario)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      
      // Intentar obtener más detalles del error
      if (error.error) {
        console.error('Detalles del error backend:', error.error);
        if (typeof error.error === 'string') {
          errorMessage += `\nDetalles: ${error.error}`;
        } else if (error.error.message) {
          errorMessage += `\nDetalles: ${error.error.message}`;
        }
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}