import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Hotel } from '../modelos/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private baseUrl = 'http://localhost:3333/Hoteles';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.baseUrl}/Listar`).pipe(
      map(hoteles => {
        const hotelesArray = hoteles || [];
        return hotelesArray.map(hotel => ({
          ...hotel,
          ciudades: hotel.ciudades || null,
          categorias: hotel.categorias || null,
          habitaciones: hotel.habitaciones || [],
          correo: hotel.correo || '',
          telefono: hotel.telefono || '',
          contactos: hotel.contactos || ''
        }));
      }),
      catchError(this.handleError)
    );
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.baseUrl}/${id}`).pipe(
      map(hotel => ({
        ...hotel,
        ciudades: hotel.ciudades || null,
        categorias: hotel.categorias || null,
        habitaciones: hotel.habitaciones || [],
        correo: hotel.correo || '',
        telefono: hotel.telefono || '',
        contactos: hotel.contactos || ''
      })),
      catchError(this.handleError)
    );
  }

  createHotel(hotel: any): Observable<Hotel> {
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      correo: hotel.correo,
      telefono: hotel.telefono,
      contactos: hotel.contactos || '',
      precio: hotel.precio,
      ciudades: { id: hotel.ciudades?.id || hotel.ciudadId },
      categorias: { id: hotel.categorias?.id || hotel.categoriaId },
      habitaciones: hotel.habitaciones || []
    };
    
    console.log('Enviando hotel al backend:', hotelData);
    
    return this.http.post<Hotel>(`${this.baseUrl}/Crear`, hotelData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateHotel(id: number, hotel: any): Observable<Hotel> {
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      correo: hotel.correo,
      telefono: hotel.telefono,
      contactos: hotel.contactos || '',
      precio: hotel.precio,
      ciudades: { id: hotel.ciudades?.id || hotel.ciudadId },
      categorias: { id: hotel.categorias?.id || hotel.categoriaId },
      habitaciones: hotel.habitaciones || []
    };
    
    console.log('Actualizando hotel en backend:', hotelData);
    
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
    
    let errorMessage = 'Error en el servicio de hoteles';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}