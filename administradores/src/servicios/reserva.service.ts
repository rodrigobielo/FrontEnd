import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Reserva } from '../modelos/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8765/Reservas'; // Usando el puerto del gateway

  // Obtener todas las reservas
  getReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/Listar`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener reserva por ID
  getReservaById(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Crear nueva reserva
  createReserva(reservaData: any): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/Crear`, reservaData).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar reserva (para cambios generales)
  updateReserva(id: number, reservaData: any): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reservaData).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar reserva
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos que necesitan implementación en el backend
  // Estos pueden ser implementados usando los métodos existentes o marcados como no implementados
  
  // Actualizar estado de reserva - Usando updateReserva
  updateEstadoReserva(id: number, estado: string, codigo?: string): Observable<Reserva> {
    // Esta funcionalidad se puede lograr llamando a getReservaById, 
    // actualizando el estado y luego usando updateReserva
    console.warn('Actualización de estado: Considera implementar un endpoint específico en el backend');
    
    // Alternativa: Obtener la reserva, actualizar y enviar
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/estado`, { 
      estadoReserva: estado, 
      codigo: codigo || '' 
    }).pipe(
      catchError(() => {
        // Si el endpoint específico no existe, sugerir usar updateReserva
        console.warn('Endpoint PATCH no implementado. Usa updateReserva para actualizar toda la entidad.');
        return throwError(() => new Error('Endpoint no implementado. Usa updateReserva.'));
      })
    );
  }

  // Asignar habitación a reserva confirmada - Usando updateReserva
  asignarHabitacionAReserva(id: number, habitacionId: number, codigo: string): Observable<Reserva> {
    console.warn('Asignación de habitación: Considera implementar un endpoint específico en el backend');
    
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/asignar-habitacion`, {
      estadoReserva: 'confirmada',
      codigo: codigo,
      habitacionId: habitacionId
    }).pipe(
      catchError(() => {
        console.warn('Endpoint PATCH no implementado. Usa updateReserva para actualizar toda la entidad.');
        return throwError(() => new Error('Endpoint no implementado. Usa updateReserva.'));
      })
    );
  }

  // Filtrar reservas por estado - NO IMPLEMENTADO EN BACKEND
  getReservasPorEstado(estado: string): Observable<Reserva[]> {
    console.warn('Filtrado por estado no implementado en backend');
    
    return this.http.get<Reserva[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      catchError(() => {
        // Si no existe el endpoint, obtener todas y filtrar en el cliente
        console.warn('Usando filtrado en cliente como alternativa temporal');
        return this.getReservas().pipe(
          catchError(this.handleError)
        );
      })
    );
  }

  // Buscar reserva por código - NO IMPLEMENTADO EN BACKEND
  buscarReservaPorCodigo(codigo: string): Observable<Reserva> {
    console.warn('Búsqueda por código no implementada en backend');
    
    return this.http.get<Reserva>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      catchError(() => {
        console.warn('Endpoint no implementado. Considera implementar en backend.');
        return throwError(() => new Error('Endpoint no implementado'));
      })
    );
  }

  // Obtener estadísticas - NO IMPLEMENTADO EN BACKEND
  getEstadisticasReservas(): Observable<any> {
    console.warn('Estadísticas no implementadas en backend');
    
    return this.http.get<any>(`${this.apiUrl}/estadisticas`).pipe(
      catchError(() => {
        console.warn('Endpoint no implementado. Considera implementar en backend.');
        return throwError(() => new Error('Endpoint no implementado'));
      })
    );
  }

  // Manejo de errores mejorado
  private handleError(error: any): Observable<never> {
    console.error('Error en el servicio de reservas:', error);
    let errorMessage = 'Error en el servidor';
    
    if (error.status === 0) {
      // Error de conexión (servidor no disponible)
      errorMessage = 'No se puede conectar con el gateway (puerto 8765). Verifica que esté corriendo.';
    } else if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 400:
          errorMessage = 'Datos inválidos o mal formados';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}