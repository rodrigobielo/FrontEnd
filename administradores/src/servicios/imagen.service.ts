import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Imagen } from '../modelos/imagen.model';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private baseUrl = 'http://localhost:8765/Imagenes';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  createImagen(imagen: Imagen): Observable<Imagen> {
    return this.http.post<Imagen>(`${this.baseUrl}/Crear`, imagen, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateImagen(id: number, imagen: Imagen): Observable<Imagen> {
    return this.http.put<Imagen>(`${this.baseUrl}/${id}`, imagen, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteImagen(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getImagenes(): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${this.baseUrl}/Listar`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio Imagen:', error);
    return throwError(() => new Error('Error en el servicio de imágenes'));
  }
}