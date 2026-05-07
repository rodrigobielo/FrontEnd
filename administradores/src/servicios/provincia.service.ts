import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Provincia, ProvinciaBackend, ProvinciaSimple } from '../modelos/provincia.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  private apiUrl = 'http://localhost:3333/Provincias';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Método getAll que funciona con la estructura del backend
  getAll(): Observable<ProvinciaSimple[]> {
    console.log('Llamando al endpoint:', `${this.apiUrl}/Listar`);
    
    return this.http.get<any[]>(`${this.apiUrl}/Listar`)
      .pipe(
        map(response => {
          console.log('Respuesta del backend:', response);
          
          // Verificar si la respuesta es un array
          if (!response || !Array.isArray(response)) {
            console.warn('La respuesta no es un array:', response);
            return [];
          }
          
          // Transformar la respuesta a ProvinciaSimple[]
          return this.transformarProvincias(response);
        }),
        catchError(this.manejarError)
      );
  }

  // Transformar la respuesta del backend a ProvinciaSimple[]
  private transformarProvincias(provincias: any[]): ProvinciaSimple[] {
    if (!provincias || !Array.isArray(provincias)) {
      return [];
    }
    
    return provincias.map(provincia => ({
      id: provincia.id || provincia.idProvincia || 0,
      nombre: provincia.nombre || provincia.nombreProvincia || 'Sin nombre'
    }));
  }

  // Método obtenerProvincias - CORREGIDO
  obtenerProvincias(): Observable<Provincia[]> {
    console.log('Obteniendo provincias desde:', `${this.apiUrl}/Listar`);
    
    return this.http.get<any[]>(`${this.apiUrl}/Listar`)
      .pipe(
        map(response => {
          console.log('Respuesta completa del backend:', response);
          
          if (!response || !Array.isArray(response)) {
            console.warn('Respuesta no es un array:', response);
            return [];
          }
          
          // Mapear la respuesta a la estructura esperada
          const provincias = response.map(item => ({
            id: item.id || item.idProvincia,
            nombre: item.nombre || item.nombreProvincia,
            regiones: item.regiones || null
          }));
          
          console.log('Provincias mapeadas:', provincias);
          return provincias;
        }),
        catchError(this.manejarError)
      );
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
    
    console.log('Creando provincia con datos:', provinciaBackend);
    
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
    
    console.log(`Actualizando provincia ${id} con datos:`, provinciaBackend);
    
    return this.http.put<Provincia>(`${this.apiUrl}/${id}`, provinciaBackend, this.httpOptions)
      .pipe(catchError(this.manejarError));
  }

  eliminarProvincia(id: number): Observable<void> {
    console.log(`Eliminando provincia ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  private manejarError(error: any) {
    let mensajeError = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      mensajeError = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 0) {
      mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3333';
    } else {
      // Error del lado del servidor
      mensajeError = `Error ${error.status}: ${error.message}`;
      console.error('Detalles del error:', error.error);
    }
    
    console.error('Error en servicio Provincia:', mensajeError);
    return throwError(() => new Error(mensajeError));
  }
}