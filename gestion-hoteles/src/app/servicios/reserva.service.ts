import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reserva, ReservaDetallada, ReservaRequest } from '../modelos/reserva.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8765/Reservas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  // Obtener todas las reservas (para admin)
  getAllReservas(): Observable<ReservaDetallada[]> {
    return this.http.get<ReservaDetallada[]>(`${this.apiUrl}/Listar`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
  }

  // Obtener reservas del usuario actual - CORREGIDO para filtrar por usuario
  getReservasUsuario(): Observable<ReservaDetallada[]> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario || !usuario.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.getAllReservas().pipe(
      map(reservas => reservas.filter(reserva => {
        // Filtrar por ID de usuario
        if (reserva.usuarios && reserva.usuarios.id) {
          return reserva.usuarios.id === usuario.id;
        }
        return false;
      }))
    );
  }

  // Obtener una reserva por ID
  getReservaById(id: number): Observable<ReservaDetallada> {
    return this.http.get<ReservaDetallada>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
  }

  // Crear nueva reserva
  crearReserva(reservaRequest: ReservaRequest): Observable<ReservaDetallada> {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario || !usuario.id) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const reserva: Reserva = {
      ...reservaRequest,
      usuarios: { id: usuario.id }
    };

    return this.http.post<ReservaDetallada>(`${this.apiUrl}/Crear`, reserva, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
  }

  // Actualizar reserva
  actualizarReserva(id: number, reserva: Reserva): Observable<ReservaDetallada> {
    return this.http.put<ReservaDetallada>(`${this.apiUrl}/${id}`, reserva, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
  }

  // Cancelar reserva (estado = 'CANCELADA')
  cancelarReserva(id: number): Observable<ReservaDetallada> {
    return this.http.put<ReservaDetallada>(`${this.apiUrl}/${id}`, { 
      estadoReserva: 'CANCELADA' 
    }, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
  }

  // Eliminar reserva
  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.manejarError)
    );
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
          errorMessage = 'No autorizado. Por favor, inicia sesión.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
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