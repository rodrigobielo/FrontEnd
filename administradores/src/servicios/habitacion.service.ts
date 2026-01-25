import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Habitacion } from '../modelos/habitacion.model';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {  // IMPORTANTE: Nombre correcto de la clase
  private baseUrl = 'http://localhost:8765/Habitaciones';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/Listar`).pipe(
      map(habitaciones => {
        const habitacionesArray = habitaciones || [];
        return habitacionesArray.map(habitacion => ({
          ...habitacion,
          hoteles: habitacion.hoteles || null,
          tiposHabitaciones: habitacion.tiposHabitaciones || null
        }));
      }),
      catchError(this.handleError)
    );
  }

  getHabitacionById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.baseUrl}/${id}`).pipe(
      map(habitacion => ({
        ...habitacion,
        hoteles: habitacion.hoteles || null,
        tiposHabitaciones: habitacion.tiposHabitaciones || null
      })),
      catchError(this.handleError)
    );
  }

  getHabitacionesByHotel(hotelId: number): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.baseUrl}/hotel/${hotelId}`).pipe(
      map(habitaciones => {
        const habitacionesArray = habitaciones || [];
        return habitacionesArray.map(habitacion => ({
          ...habitacion,
          hoteles: habitacion.hoteles || null,
          tiposHabitaciones: habitacion.tiposHabitaciones || null
        }));
      }),
      catchError(this.handleError)
    );
  }

  createHabitacion(habitacion: any): Observable<Habitacion> {
    const habitacionData = {
      precioNoche: habitacion.precioNoche,
      disponibilidad: habitacion.disponibilidad,
      caracteristicas: habitacion.caracteristicas,
      hoteles: { id: habitacion.hotelId },
      tiposHabitaciones: { id: habitacion.tipoHabitacionId }
    };
    
    return this.http.post<Habitacion>(`${this.baseUrl}/Crear`, habitacionData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateHabitacion(id: number, habitacion: any): Observable<Habitacion> {
    const habitacionData = {
      precioNoche: habitacion.precioNoche,
      disponibilidad: habitacion.disponibilidad,
      caracteristicas: habitacion.caracteristicas,
      hoteles: { id: habitacion.hotelId },
      tiposHabitaciones: { id: habitacion.tipoHabitacionId }
    };
    
    return this.http.put<Habitacion>(`${this.baseUrl}/${id}`, habitacionData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteHabitacion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleDisponibilidad(id: number, disponibilidad: boolean): Observable<Habitacion> {
    return this.http.patch<Habitacion>(`${this.baseUrl}/${id}/disponibilidad`, { disponibilidad }, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio Habitacion:', error);
    
    let errorMessage = 'Error en el servicio de habitaciones';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}