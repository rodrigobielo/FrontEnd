import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ciudad, CiudadDTO } from '../modelos/ciudad.model';

@Injectable({
  providedIn: 'root'
})
export class CiudadService {
  private apiUrl = 'http://localhost:8765/Ciudades';

  constructor(private http: HttpClient) { }

  private transformCiudadResponse(data: any): Ciudad {
    console.log('Transformando respuesta de ciudad:', data);
    
    return {
      id: data.id || 0,
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      provinciaId: data.provincias ? data.provincias.id : (data.provinciaId || 0)
    };
  }

  getAll(): Observable<Ciudad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Listar`).pipe(
      map(ciudades => {
        console.log('Respuesta cruda de ciudades:', ciudades);
        return ciudades.map(ciudad => this.transformCiudadResponse(ciudad));
      })
    );
  }

  getById(id: number): Observable<Ciudad> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(ciudad => this.transformCiudadResponse(ciudad))
    );
  }

  create(ciudad: CiudadDTO): Observable<Ciudad> {
    const ciudadBackend = {
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provincias: { id: ciudad.provinciaId }
    };
    
    console.log('Enviando ciudad al backend:', ciudadBackend);
    
    return this.http.post<any>(`${this.apiUrl}/Crear`, ciudadBackend).pipe(
      map(ciudad => this.transformCiudadResponse(ciudad))
    );
  }

  update(id: number, ciudad: CiudadDTO): Observable<Ciudad> {
    const ciudadBackend = {
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provincias: { id: ciudad.provinciaId }
    };
    
    console.log('Actualizando ciudad:', ciudadBackend);
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, ciudadBackend).pipe(
      map(ciudad => this.transformCiudadResponse(ciudad))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}