import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Provincia, ProvinciaBackend, ProvinciaSimple } from '../modelos/provincia.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  private apiUrl = 'http://localhost:8765/Provincias';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Método getAll que funciona con la estructura del backend
  getAll(): Observable<ProvinciaSimple[]> {
    return this.http.get<Provincia[]>(`${this.apiUrl}/Listar`)
      .pipe(
        map(provincias => this.transformarProvincias(provincias)),
        catchError(this.manejarError)
      );
  }

  // Transformar la respuesta del backend a ProvinciaSimple[]
  private transformarProvincias(provincias: Provincia[]): ProvinciaSimple[] {
    if (!provincias || !Array.isArray(provincias)) {
      return [];
    }
    
    return provincias.map(provincia => ({
      id: provincia.id || 0,
      nombre: provincia.nombre || 'Sin nombre'
    }));
  }

  obtenerProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.apiUrl}/Listar`)
      .pipe(catchError(this.manejarError));
  }

  obtenerProvinciaPorId(id: number): Observable<Provincia> {
    return this.http.get<Provincia>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  crearProvincia(nombre: string, regionId: number): Observable<Provincia> {
    const provinciaBackend: ProvinciaBackend = {
      nombre: nombre,
      regiones: {
        id: regionId
      }
    };
    
    return this.http.post<Provincia>(`${this.apiUrl}/Crear`, provinciaBackend, this.httpOptions)
      .pipe(catchError(this.manejarError));
  }

  actualizarProvincia(id: number, nombre: string, regionId: number): Observable<Provincia> {
    const provinciaBackend: ProvinciaBackend = {
      nombre: nombre,
      regiones: {
        id: regionId
      }
    };
    
    console.log('Actualizando provincia con datos:', provinciaBackend);
    
    return this.http.put<Provincia>(`${this.apiUrl}/${id}`, provinciaBackend, this.httpOptions)
      .pipe(catchError(this.manejarError));
  }

  eliminarProvincia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: any) {
    let mensajeError = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      mensajeError = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 0) {
      mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    } else {
      mensajeError = `Error ${error.status}: ${error.message}`;
      console.error('Detalles del error:', error.error);
    }
    
    console.error('Error en servicio Provincia:', mensajeError);
    return throwError(() => new Error(mensajeError));
  }
}