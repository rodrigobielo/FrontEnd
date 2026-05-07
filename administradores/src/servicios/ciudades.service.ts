// ciudades.service.ts - Versión CORREGIDA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Ciudad, CiudadDTO } from '../modelos/ciudad.model';

@Injectable({
  providedIn: 'root'
})
export class CiudadService {
  private apiUrl = 'http://localhost:3333/Ciudades';

  constructor(private http: HttpClient) { }

  private transformarRespuesta(data: any): Ciudad {
    return {
      id: data.id || 0,
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      provinciaId: data.provincias ? data.provincias.id : (data.provinciaId || 0),
      provincias: data.provincias
    };
  }

  getAll(): Observable<Ciudad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Listar`).pipe(
      map(response => {
        if (!response || !Array.isArray(response)) return [];
        return response.map(item => this.transformarRespuesta(item));
      }),
      catchError(this.manejarError)
    );
  }

  // SOLUCIÓN CORRECTA: Enviar provincia como objeto con ID
  create(ciudadDTO: CiudadDTO): Observable<Ciudad> {
    if (!ciudadDTO.provinciaId || ciudadDTO.provinciaId <= 0) {
      return throwError(() => new Error('Debe seleccionar una provincia válida'));
    }
    
    // Crear un objeto provincia con SOLO el ID
    const provincia = {
      id: ciudadDTO.provinciaId
    };
    
    // Enviar la ciudad con la provincia anidada
    const ciudadBackend = {
      nombre: ciudadDTO.nombre,
      descripcion: ciudadDTO.descripcion,
      provincias: provincia  // ← Aquí enviamos el objeto provincia
    };
    
    console.log('=== ENVIANDO CIUDAD AL BACKEND ===');
    console.log('Datos a enviar:', JSON.stringify(ciudadBackend, null, 2));
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.post<any>(`${this.apiUrl}/Crear`, ciudadBackend, httpOptions).pipe(
      map(response => {
        console.log('Respuesta exitosa:', response);
        return this.transformarRespuesta(response);
      }),
      catchError(this.manejarError)
    );
  }

  update(id: number, ciudadDTO: CiudadDTO): Observable<Ciudad> {
    if (!ciudadDTO.provinciaId || ciudadDTO.provinciaId <= 0) {
      return throwError(() => new Error('Debe seleccionar una provincia válida'));
    }
    
    const provincia = {
      id: ciudadDTO.provinciaId
    };
    
    const ciudadBackend = {
      nombre: ciudadDTO.nombre,
      descripcion: ciudadDTO.descripcion,
      provincias: provincia
    };
    
    console.log('=== ACTUALIZANDO CIUDAD ===');
    console.log('ID:', id);
    console.log('Datos a enviar:', JSON.stringify(ciudadBackend, null, 2));
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, ciudadBackend).pipe(
      map(response => this.transformarRespuesta(response)),
      catchError(this.manejarError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.manejarError)
    );
  }

  private manejarError(error: any): Observable<never> {
    console.error('=== ERROR EN SERVICIO CIUDAD ===');
    console.error('Status:', error.status);
    console.error('Mensaje:', error.message);
    
    let mensajeError = 'Error al procesar la ciudad';
    
    if (error.error && typeof error.error === 'string') {
      mensajeError = error.error;
    } else if (error.error && error.error.message) {
      mensajeError = error.error.message;
    }
    
    return throwError(() => new Error(mensajeError));
  }
}