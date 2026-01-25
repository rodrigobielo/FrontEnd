import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TipoHabitacion } from '../modelos/habitacion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoHabitacionService {
  private baseUrl = 'http://localhost:8765/TiposHabitaciones';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getTiposHabitacion(): Observable<TipoHabitacion[]> {
    return this.http.get<TipoHabitacion[]>(`${this.baseUrl}/Listar`).pipe(
      map(tipos => tipos || []),
      catchError(this.handleError)
    );
  }

  getTipoHabitacionById(id: number): Observable<TipoHabitacion> {
    return this.http.get<TipoHabitacion>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createTipoHabitacion(tipo: TipoHabitacion): Observable<TipoHabitacion> {
    return this.http.post<TipoHabitacion>(`${this.baseUrl}/Crear`, tipo, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateTipoHabitacion(id: number, tipo: TipoHabitacion): Observable<TipoHabitacion> {
    return this.http.put<TipoHabitacion>(`${this.baseUrl}/${id}`, tipo, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteTipoHabitacion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio TipoHabitacion:', error);
    
    let errorMessage = 'Error en el servicio de tipos de habitación';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}