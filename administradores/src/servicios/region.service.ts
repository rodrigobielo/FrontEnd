// src/servicios/region.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Region, RegionForm } from '../modelos/region.model'; // Asegúrate de importar ambos

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = 'http://localhost:3333/Regiones'; // URL del gateway

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todas las regiones
  obtenerRegiones(): Observable<Region[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Listar`)
      .pipe(
        map(regiones => this.mapearRegiones(regiones)),
        catchError(this.handleError)
      );
  }

  // Obtener una región por su id
  obtenerRegion(id: number): Observable<Region> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(region => this.mapearRegion(region)),
        catchError(this.handleError)
      );
  }

  // Crear una nueva región
  crearRegion(region: RegionForm): Observable<Region> {
    const payload = this.mapearParaEnvio(region);
    return this.http.post<any>(`${this.apiUrl}/Crear`, payload, this.httpOptions)
      .pipe(
        map(response => this.mapearRegion(response)),
        catchError(this.handleError)
      );
  }

  // Actualizar una región existente
  actualizarRegion(id: number, region: RegionForm): Observable<Region> {
    const payload = this.mapearParaEnvio(region);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, this.httpOptions)
      .pipe(
        map(response => this.mapearRegion(response)),
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

  // Mapear una región del backend al frontend
  private mapearRegion(regionBackend: any): Region {
    return {
      id: regionBackend.id,
      nombre: regionBackend.nombre,
      descripcion: regionBackend.descripcion,
      codigo: regionBackend.codigo,
      fechaCreacion: regionBackend.fechaCreacion
    };
  }

  // Mapear lista de regiones
  private mapearRegiones(regionesBackend: any[]): Region[] {
    return regionesBackend.map(region => this.mapearRegion(region));
  }

  // Mapear datos del frontend al formato del backend
  private mapearParaEnvio(region: RegionForm): any {
    return {
      nombre: region.nombre,
      descripcion: region.descripcion,
      codigo: region.codigo || null,
      fechaCreacion: new Date().toISOString() // Generar fecha si es nueva
    };
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Algo malo sucedió; por favor, inténtelo de nuevo más tarde.';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error del cliente:', error.error.message);
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      console.error(`Código de error del servidor: ${error.status}, cuerpo: ${error.error}`);
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 400) {
        errorMessage = 'Datos inválidos. Verifique la información ingresada.';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor. Intente más tarde.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}