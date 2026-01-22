import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Hotel } from '../modelos/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private baseUrl = 'http://localhost:8765/Hoteles';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.baseUrl}/Listar`).pipe(
      map(hoteles => {
        // Si la respuesta es null, asigna un array vacío
        const hotelesArray = hoteles || [];
        return hotelesArray.map(hotel => ({
          ...hotel,
          ciudadId: hotel.ciudades?.id,
          categoriaId: hotel.categorias?.id
        }));
      }),
      catchError(this.handleError)
    );
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createHotel(hotel: Hotel): Observable<Hotel> {
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      contrasena: hotel.contrasena,
      ciudades: { id: hotel.ciudadId },
      categorias: { id: hotel.categoriaId }
    };
    
    return this.http.post<Hotel>(`${this.baseUrl}/Crear`, hotelData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateHotel(id: number, hotel: Hotel): Observable<Hotel> {
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      contrasena: hotel.contrasena,
      ciudades: { id: hotel.ciudadId },
      categorias: { id: hotel.categoriaId }
    };
    
    return this.http.put<Hotel>(`${this.baseUrl}/${id}`, hotelData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteHotel(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio Hotel:', error);
    return throwError(() => new Error('Error en el servicio de hoteles'));
  }
}