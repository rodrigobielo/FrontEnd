import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Importar desde el archivo correcto
import { ReservaRequest, ReservaResponse, Habitacion, Hotel } from '../modelos/nueva-reserva.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NuevaReservaService {
  private apiUrl = 'http://localhost:8765';
  private usuarioKey = 'usuarioTurismo';

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

  // Crear nueva reserva - usar ReservaRequest y ReservaResponse
  crearReserva(reservaRequest: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(
      `${this.apiUrl}/Reservas/Crear`,
      reservaRequest,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  // Obtener todas las reservas
  getReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(
      `${this.apiUrl}/Reservas/Listar`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  // Obtener reserva por ID
  getReservaById(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(
      `${this.apiUrl}/Reservas/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  // Obtener hoteles
  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(
      `${this.apiUrl}/Hoteles/Listar`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  // Obtener habitaciones por hotel
  getHabitacionesPorHotel(hotelId: number): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(
      `${this.apiUrl}/Hoteles/${hotelId}/habitaciones`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.manejarError)
    );
  }

  // Generar código de reserva
  generarCodigoReserva(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
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
          errorMessage = error.error?.message || 'Datos inválidos para la reserva';
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
        case 409:
          errorMessage = 'La habitación no está disponible para las fechas seleccionadas.';
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