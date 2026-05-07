// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3333/';

  constructor(private http: HttpClient) { }

  // Método de login
  login(credentials: any): Observable<any> {
    const loginData = {
      email: credentials.email,
      contrasena: credentials.contrasena
    };
    
    return this.http.post<any>(`${this.apiUrl}auth/login`, loginData)
      .pipe(
        map(response => {
          if (response.success) {
            return {
              token: response.token,
              usuario: response.usuario,
              mensaje: response.message,
              success: true
            };
          } else {
            throw { 
              status: 401, 
              message: response.message || 'Credenciales inválidas'
            };
          }
        }),
        catchError(this.handleError)
      );
  }

  // MÉTODO PARA OBTENER HOTEL POR ID - USANDO TU ENDPOINT REAL
  getHotelInfoById(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}hotel/info/${hotelId}`)
      .pipe(
        map(response => {
          console.log('Respuesta del servidor (hotel info):', response);
          
          // Verificar la estructura de tu respuesta
          if (response && response.success === true && response.data) {
            return response.data;
          }
          
          // Si la respuesta es directamente el hotel
          if (response && response.id) {
            return response;
          }
          
          // Si hay un mensaje de error
          if (response && response.message) {
            throw new Error(response.message);
          }
          
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Método para verificar conexión
  verificarConexion(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Métodos CRUD para usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(catchError(this.handleError));
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Usuarios/Crear`, usuario)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Usuarios/Actualizar/${id}`, usuario)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Usuarios/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para habitaciones
  getHabitaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Habitaciones/Listar`)
      .pipe(catchError(this.handleError));
  }

  getHabitacionesPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/habitaciones`)
      .pipe(catchError(this.handleError));
  }

  crearHabitacion(habitacion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Habitaciones/Crear`, habitacion)
      .pipe(catchError(this.handleError));
  }

  actualizarHabitacion(id: number, habitacion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Habitaciones/Actualizar/${id}`, habitacion)
      .pipe(catchError(this.handleError));
  }

  eliminarHabitacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Habitaciones/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para reservas
  getReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Reservas/Listar`)
      .pipe(catchError(this.handleError));
  }

  getReservasPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/reservas`)
      .pipe(catchError(this.handleError));
  }

  crearReserva(reserva: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Reservas/Crear`, reserva)
      .pipe(catchError(this.handleError));
  }

  actualizarReserva(id: number, reserva: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Reservas/Actualizar/${id}`, reserva)
      .pipe(catchError(this.handleError));
  }

  eliminarReserva(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Reservas/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para clientes
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Clientes/Listar`)
      .pipe(catchError(this.handleError));
  }

  getClientesPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/clientes`)
      .pipe(catchError(this.handleError));
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Clientes/Crear`, cliente)
      .pipe(catchError(this.handleError));
  }

  actualizarCliente(id: number, cliente: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Clientes/Actualizar/${id}`, cliente)
      .pipe(catchError(this.handleError));
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Clientes/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para pagos
  getPagos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Pagos/Listar`)
      .pipe(catchError(this.handleError));
  }

  getPagosPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/pagos`)
      .pipe(catchError(this.handleError));
  }

  crearPago(pago: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Pagos/Crear`, pago)
      .pipe(catchError(this.handleError));
  }

  actualizarPago(id: number, pago: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Pagos/Actualizar/${id}`, pago)
      .pipe(catchError(this.handleError));
  }

  eliminarPago(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Pagos/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para tipos de habitación
  getTiposHabitacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/TiposHabitacion/Listar`)
      .pipe(catchError(this.handleError));
  }

  getTiposHabitacionPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/tipos-habitacion`)
      .pipe(catchError(this.handleError));
  }

  crearTipoHabitacion(tipo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TiposHabitacion/Crear`, tipo)
      .pipe(catchError(this.handleError));
  }

  actualizarTipoHabitacion(id: number, tipo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/TiposHabitacion/Actualizar/${id}`, tipo)
      .pipe(catchError(this.handleError));
  }

  eliminarTipoHabitacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/TiposHabitacion/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Métodos CRUD para fotos
  getFotos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Fotos/Listar`)
      .pipe(catchError(this.handleError));
  }

  getFotosPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/fotos`)
      .pipe(catchError(this.handleError));
  }

  subirFoto(foto: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Fotos/Subir`, foto)
      .pipe(catchError(this.handleError));
  }

  eliminarFoto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Fotos/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ApiService:', error);
    
    let errorMessage = 'Error desconocido';
    let errorDetails: any = null;
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de cliente: ${error.error.message}`;
      errorDetails = error.error;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión con el servidor';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          errorDetails = error.error;
          break;
        case 401:
          errorMessage = error.error?.message || 'No autorizado. Por favor, inicie sesión nuevamente.';
          errorDetails = error.error;
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto con los datos existentes';
          break;
        case 422:
          errorMessage = error.error?.message || 'Datos inválidos';
          errorDetails = error.error?.errors;
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => ({ 
      status: error.status, 
      message: errorMessage,
      details: errorDetails,
      originalError: error
    }));
  }
}