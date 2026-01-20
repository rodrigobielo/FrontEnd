import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Region } from '../modelos/region.model';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = 'http://localhost:8765/Regiones'; // URL del gateway

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todas las regiones
  obtenerRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/Listar`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener una región por su id
  obtenerRegion(id: number): Observable<Region> {
    return this.http.get<Region>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear una nueva región
  crearRegion(region: Region): Observable<Region> {
    return this.http.post<Region>(`${this.apiUrl}/Crear`, region, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar una región existente
  actualizarRegion(id: number, region: Region): Observable<Region> {
    return this.http.put<Region>(`${this.apiUrl}/${id}`, region, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar una región
  eliminarRegion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error del cliente:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(`Código de error del servidor: ${error.status}, ` + `cuerpo: ${error.error}`);
    }
    // Devuelve un mensaje de error amigable
    return throwError(() => new Error('Algo malo sucedió; por favor, inténtelo de nuevo más tarde.'));
  }
}