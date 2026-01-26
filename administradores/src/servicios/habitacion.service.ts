import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Habitacion } from '../modelos/habitacion.model';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8765/Habitaciones'; // Coincide con @RequestMapping("/Habitaciones")

  // Obtener todas las habitaciones
  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.apiUrl}/Listar`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener habitación por ID
  getHabitacionById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Crear nueva habitación
  createHabitacion(habitacionData: any): Observable<Habitacion> {
    return this.http.post<Habitacion>(`${this.apiUrl}/Crear`, habitacionData).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar habitación
  updateHabitacion(id: number, habitacionData: any): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.apiUrl}/${id}`, habitacionData).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar habitación
  deleteHabitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos alternativos para compatibilidad (si necesitas mantener la interfaz)
  // Estos métodos pueden redirigir a los existentes o puedes eliminarlos si no los usas
  
  // Obtener habitaciones por hotel - NO IMPLEMENTADO EN BACKEND
  getHabitacionesPorHotel(hotelId: number): Observable<Habitacion[]> {
    console.warn('Método no implementado en backend');
    return throwError(() => new Error('Endpoint no implementado en backend'));
  }

  // Obtener habitaciones disponibles por hotel y tipo - NO IMPLEMENTADO EN BACKEND
  getHabitacionesDisponiblesPorHotelYTipo(hotelId: number, tipo: string): Observable<Habitacion[]> {
    console.warn('Método no implementado en backend');
    return throwError(() => new Error('Endpoint no implementado en backend'));
  }

  // Actualizar disponibilidad de habitación - NO IMPLEMENTADO COMO ENDPOINT SEPARADO
  // Puedes usar updateHabitacion para actualizar toda la entidad
  updateDisponibilidadHabitacion(id: number, disponible: boolean): Observable<Habitacion> {
    // Si quieres mantener esta funcionalidad, necesitarías implementar en backend:
    // PATCH /Habitaciones/{id}/disponibilidad
    console.warn('Método no implementado en backend - Usa updateHabitacion en su lugar');
    return throwError(() => new Error('Endpoint no implementado en backend'));
  }

  // Toggle disponibilidad (alternar) - NO IMPLEMENTADO EN BACKEND
  toggleDisponibilidad(id: number, disponible: boolean): Observable<Habitacion> {
    console.warn('Método no implementado en backend');
    return throwError(() => new Error('Endpoint no implementado en backend'));
  }

  // Manejo de errores mejorado
  private handleError(error: any): Observable<never> {
    console.error('Error en el servicio de habitaciones:', error);
    let errorMessage = 'Error en el servidor';
    
    if (error.status === 0) {
      // Error de conexión (servidor no disponible)
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté corriendo en el puerto 8080.';
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