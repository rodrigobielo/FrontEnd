// usuario.service.ts - CORREGIDO PARA GATEWAY
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Usuario, 
  UsuarioResponse, 
  UsuarioCreate,
  UsuarioEmpleadoCreate, 
  UsuarioCompletoResponse
} from '../modelos/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // El Gateway corre en el puerto 3333
  private gatewayUrl = 'http://localhost:3333';
  
  // URLs basadas en las rutas del Gateway
  private usuariosUrl = `${this.gatewayUrl}/Usuarios`;  // Coincide con Path=/Usuarios/**
  private usuariosEmpleadosUrl = `${this.gatewayUrl}/Usuarios-Empleados`;  // Coincide con Path=/Usuarios-Empleados/**
  private empleadosUrl = `${this.gatewayUrl}/Empleados`;  // Coincide con Path=/Empleados/**

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // ==================== MÉTODOS PARA USUARIOS NORMALES ====================
  
  // GET /Usuarios/Listar
  getUsuarios(): Observable<UsuarioResponse[]> {
    const url = `${this.usuariosUrl}/Listar`;
    console.log('Llamando a:', url);
    return this.http.get<UsuarioResponse[]>(url, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // GET /Usuarios/{id}
  getUsuarioById(id: number): Observable<UsuarioResponse> {
    const url = `${this.usuariosUrl}/${id}`;
    return this.http.get<UsuarioResponse>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // POST /Usuarios/Crear
  create(usuario: UsuarioCreate): Observable<UsuarioResponse> {
    const url = `${this.usuariosUrl}/Crear`;
    console.log('Creando usuario en:', url);
    return this.http.post<UsuarioResponse>(url, usuario, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /Usuarios/Actualizar/{id}
  update(id: number, usuario: any): Observable<UsuarioResponse> {
    const url = `${this.usuariosUrl}/Actualizar/${id}`;
    return this.http.put<UsuarioResponse>(url, usuario, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /Usuarios/Eliminar/{id}
  delete(id: number): Observable<void> {
    const url = `${this.usuariosUrl}/Eliminar/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== MÉTODOS PARA USUARIOS EMPLEADOS ====================
  
  // GET /Usuarios-Empleados/todos
  getAllUsuariosEmpleados(): Observable<UsuarioCompletoResponse[]> {
    const url = `${this.usuariosEmpleadosUrl}/todos`;
    console.log('Obteniendo usuarios empleados en:', url);
    return this.http.get<UsuarioCompletoResponse[]>(url, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // GET /Usuarios-Empleados/{id}
  getUsuarioEmpleadoById(idUsuario: number): Observable<UsuarioCompletoResponse> {
    const url = `${this.usuariosEmpleadosUrl}/${idUsuario}`;
    console.log(`Obteniendo usuario empleado en:`, url);
    return this.http.get<UsuarioCompletoResponse>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // POST /Usuarios-Empleados/crear
  createUsuarioEmpleado(usuarioEmpleado: UsuarioEmpleadoCreate): Observable<UsuarioCompletoResponse> {
    const requestDTO = {
      nombre: usuarioEmpleado.nombre,
      apellidos: usuarioEmpleado.apellidos,
      telefono: usuarioEmpleado.telefono,
      nacionalidad: usuarioEmpleado.nacionalidad,
      numPasaporte: usuarioEmpleado.numPasaporte,
      contrasena: usuarioEmpleado.contrasena,
      usuario: usuarioEmpleado.usuario,
      email: usuarioEmpleado.email,
      hotelId: usuarioEmpleado.hotelId,
      rolId: usuarioEmpleado.rolId || null,
      rolEmpleado: usuarioEmpleado.rolEmpleado || null
    };
    
    const url = `${this.usuariosEmpleadosUrl}/crear`;
    console.log('Creando usuario empleado en:', url);
    console.log('Datos enviados:', requestDTO);
    
    return this.http.post<UsuarioCompletoResponse>(url, requestDTO, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /Usuarios-Empleados/editar/{id}
  updateUsuarioEmpleado(idUsuario: number, usuarioEmpleado: any): Observable<UsuarioCompletoResponse> {
    const url = `${this.usuariosEmpleadosUrl}/editar/${idUsuario}`;
    console.log(`Actualizando usuario empleado en:`, url);
    return this.http.put<UsuarioCompletoResponse>(url, usuarioEmpleado, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE /Usuarios-Empleados/eliminar/{id}
  deleteUsuarioEmpleado(idUsuario: number): Observable<any> {
    const url = `${this.usuariosEmpleadosUrl}/eliminar/${idUsuario}`;
    console.log(`Eliminando usuario empleado en:`, url);
    return this.http.delete(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // GET /Usuarios-Empleados/hotel/{hotelId}
  getUsuariosPorHotel(hotelId: number): Observable<UsuarioCompletoResponse[]> {
    const url = `${this.usuariosEmpleadosUrl}/hotel/${hotelId}`;
    console.log(`Obteniendo usuarios por hotel en:`, url);
    return this.http.get<UsuarioCompletoResponse[]>(url, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // ==================== MÉTODOS PARA EMPLEADOS ====================
  
  // GET /Empleados/Listar
  getEmpleados(): Observable<any[]> {
    const url = `${this.empleadosUrl}/Listar`;
    return this.http.get<any[]>(url, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // GET /Empleados/usuario/{usuarioId}
  getEmpleadoByUsuarioId(usuarioId: number): Observable<any> {
    const url = `${this.empleadosUrl}/usuario/${usuarioId}`;
    return this.http.get(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // PUT /Empleados/ActualizarPorUsuario/{usuarioId}
  updateEmpleado(usuarioId: number, empleadoData: any): Observable<any> {
    const url = `${this.empleadosUrl}/ActualizarPorUsuario/${usuarioId}`;
    return this.http.put(url, empleadoData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ==================== MÉTODOS UTILITARIOS ====================
  
  private safeMapResponse(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.usuarios && Array.isArray(response.usuarios)) return response.usuarios;
    if (typeof response === 'object') return [response];
    return [];
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido en el servicio de usuarios';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.mensaje) {
        errorMessage = error.error.mensaje;
      }
    }
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor. Verifica que el Gateway esté corriendo en http://localhost:3333';
    } else if (error.status === 404) {
      errorMessage = `El endpoint ${error.url} no existe. Verifica la ruta en el Gateway.`;
    } else if (error.status === 403) {
      errorMessage = errorMessage || 'Acceso denegado. Verifica CORS en el Gateway.';
    } else if (error.status === 400) {
      errorMessage = errorMessage || 'Error en los datos enviados.';
    } else if (error.status === 500) {
      errorMessage = errorMessage || 'Error interno del servidor.';
    }
    
    console.error('Error en UsuarioService:', error);
    console.error('URL que causó el error:', error.url);
    
    return throwError(() => new Error(errorMessage));
  }
}