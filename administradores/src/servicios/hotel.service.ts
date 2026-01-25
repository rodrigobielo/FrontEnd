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
        // Asegurar que siempre retornamos un array
        const hotelesArray = hoteles || [];
        return hotelesArray.map(hotel => ({
          ...hotel,
          // Asegurar que las propiedades anidadas existan
          ciudades: hotel.ciudades || null,
          categorias: hotel.categorias || null,
          usuarios: hotel.usuarios || null,
          habitaciones: hotel.habitaciones || []
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
        usuarios: hotel.usuarios || null,
        habitaciones: hotel.habitaciones || []
      })),
      catchError(this.handleError)
    );
  }

  createHotel(hotel: any): Observable<Hotel> {
    // Asegurar que el objeto tenga la estructura correcta
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      precio: hotel.precio,
      ciudades: { id: hotel.ciudades?.id || hotel.ciudadId },
      categorias: { id: hotel.categorias?.id || hotel.categoriaId },
      usuarios: { id: hotel.usuarios?.id || hotel.administradorId },
      habitaciones: hotel.habitaciones || []
    };
    
    console.log('Enviando hotel al backend:', hotelData);
    
    return this.http.post<Hotel>(`${this.baseUrl}/Crear`, hotelData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateHotel(id: number, hotel: any): Observable<Hotel> {
    // Asegurar que el objeto tenga la estructura correcta
    const hotelData = {
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      precio: hotel.precio,
      ciudades: { id: hotel.ciudades?.id || hotel.ciudadId },
      categorias: { id: hotel.categorias?.id || hotel.categoriaId },
      usuarios: { id: hotel.usuarios?.id || hotel.administradorId },
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
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}