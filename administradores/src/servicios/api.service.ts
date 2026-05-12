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

  // ==================== MÉTODOS DE AUTENTICACIÓN ====================
  
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

  // Verificar conexión
  verificarConexion(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // ==================== MÉTODOS PARA HOTELES ====================
  
  // Obtener hotel por ID
  getHotelInfoById(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}hotel/info/${hotelId}`)
      .pipe(
        map(response => {
          console.log('Respuesta del servidor (hotel info):', response);
          
          if (response && response.success === true && response.data) {
            return response.data;
          }
          
          if (response && response.id) {
            return response;
          }
          
          if (response && response.message) {
            throw new Error(response.message);
          }
          
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Obtener todos los hoteles
  getHoteles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Hoteles/Listar`)
      .pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS PARA EMPLEADOS ====================
  
  // Obtener empleado por ID de usuario (relación Usuario -> Empleado)
  getEmpleadoByUsuarioId(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empleados/usuario/${usuarioId}`)
      .pipe(
        map(response => {
          console.log('Respuesta del servidor (empleado por usuario):', response);
          
          // Procesar diferentes estructuras de respuesta
          if (response && response.success === true && response.data) {
            return response.data;
          }
          
          if (response && response.idEmpleado) {
            return response;
          }
          
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // Obtener todos los empleados de un hotel
  getEmpleadosPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/empleados`)
      .pipe(catchError(this.handleError));
  }

  // Obtener todos los empleados
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Empleados/Listar`)
      .pipe(catchError(this.handleError));
  }

  // Crear empleado
  crearEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Empleados/Crear`, empleado)
      .pipe(catchError(this.handleError));
  }

  // Actualizar empleado
  actualizarEmpleado(id: number, empleado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Empleados/Actualizar/${id}`, empleado)
      .pipe(catchError(this.handleError));
  }

  // Eliminar empleado
  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Empleados/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS CRUD PARA USUARIOS ====================
  
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(catchError(this.handleError));
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Usuarios/Obtener/${id}`)
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

  // ==================== MÉTODOS CRUD PARA HABITACIONES ====================
  
  getHabitaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Habitaciones/Listar`)
      .pipe(catchError(this.handleError));
  }

  getHabitacionesPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/habitaciones`)
      .pipe(
        map(response => {
          console.log(`Habitaciones del hotel ${hotelId}:`, response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getHabitacionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Habitaciones/Obtener/${id}`)
      .pipe(catchError(this.handleError));
  }

  crearHabitacion(habitacion: any): Observable<any> {
    console.log('Creando habitación:', habitacion);
    return this.http.post<any>(`${this.apiUrl}/Habitaciones/Crear`, habitacion)
      .pipe(catchError(this.handleError));
  }

  actualizarHabitacion(id: number, habitacion: any): Observable<any> {
    console.log(`Actualizando habitación ${id}:`, habitacion);
    return this.http.put<any>(`${this.apiUrl}/Habitaciones/Actualizar/${id}`, habitacion)
      .pipe(catchError(this.handleError));
  }

  eliminarHabitacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Habitaciones/Eliminar/${id}`)
      .pipe(catchError(this.handleError));
  }

  toggleDisponibilidad(id: number, disponible: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Habitaciones/${id}/disponibilidad`, { disponible })
      .pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS CRUD PARA RESERVAS ====================
  
  getReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Reservas/Listar`)
      .pipe(catchError(this.handleError));
  }

  getReservasPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/reservas`)
      .pipe(catchError(this.handleError));
  }

  getReservaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Reservas/Obtener/${id}`)
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

  updateEstadoReserva(id: number, estado: string, codigo: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Reservas/${id}/estado`, { estado, codigo })
      .pipe(catchError(this.handleError));
  }

  asignarHabitacionAReserva(reservaId: number, habitacionId: number, codigo: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/Reservas/${reservaId}/asignar-habitacion`, { 
      habitacionId, 
      codigo 
    }).pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS CRUD PARA CLIENTES ====================
  
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

  // ==================== MÉTODOS CRUD PARA PAGOS ====================
  
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

  // ==================== MÉTODOS CRUD PARA TIPOS DE HABITACIÓN ====================
  
  getTiposHabitacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/TiposHabitacion/Listar`)
      .pipe(catchError(this.handleError));
  }

  getTiposHabitacionPorHotel(hotelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/tipos-habitacion`)
      .pipe(catchError(this.handleError));
  }

  getTipoHabitacionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/TiposHabitacion/Obtener/${id}`)
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

  // ==================== MÉTODOS CRUD PARA CIUDADES ====================
  
  getCiudades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Ciudades/Listar`)
      .pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS CRUD PARA CATEGORÍAS ====================
  
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Categorias/Listar`)
      .pipe(catchError(this.handleError));
  }

  // ==================== MÉTODOS CRUD PARA FOTOS ====================
  
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

  // ==================== MÉTODOS PARA DASHBOARD Y ESTADÍSTICAS ====================
  
  getEstadisticasHotel(hotelId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hoteles/${hotelId}/estadisticas`)
      .pipe(catchError(this.handleError));
  }

  getReservasRecientes(hotelId: number, limite: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hoteles/${hotelId}/reservas/recientes?limite=${limite}`)
      .pipe(catchError(this.handleError));
  }

  // ==================== MANEJO DE ERRORES ====================
  
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
          errorMessage = 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
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
          errorMessage = error.error?.message || 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto con los datos existentes';
          break;
        case 422:
          errorMessage = error.error?.message || 'Datos inválidos';
          errorDetails = error.error?.errors;
          break;
        case 500:
          errorMessage = error.error?.message || 'Error interno del servidor';
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