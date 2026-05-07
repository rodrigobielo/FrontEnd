// usuario.service.ts - VERSIÓN COMPLETA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Usuario, 
  UsuarioResponse, 
  UsuarioCreate,
  UsuarioEmpleadoCreate, 
  UsuarioEmpleadoResponse 
} from '../modelos/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3333/Usuarios';
  private apiUsuariosEmpleadosUrl = 'http://localhost:3333/Usuarios-Empleados';
  private apiEmpleadosUrl = 'http://localhost:3333/Empleados';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsuarios(): Observable<UsuarioResponse[]> {
    console.log('Llamando a:', `${this.apiUrl}/Listar`);
    return this.http.get<UsuarioResponse[]>(`${this.apiUrl}/Listar`, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // CREAR USUARIO NORMAL - MÉTODO AGREGADO
  create(usuario: UsuarioCreate): Observable<UsuarioResponse> {
    console.log('Creando usuario en:', `${this.apiUrl}/Crear`);
    console.log('Datos enviados:', usuario);
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/Crear`, usuario, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Crear usuario como empleado
  createUsuarioEmpleado(usuarioEmpleado: UsuarioEmpleadoCreate): Observable<UsuarioEmpleadoResponse> {
    const requestDTO = {
      nombre: usuarioEmpleado.nombre,
      apellidos: usuarioEmpleado.apellidos,
      telefono: usuarioEmpleado.telefono,
      nacionalidad: usuarioEmpleado.nacionalidad,
      numPasaporte: usuarioEmpleado.numPasaporte,
      contrasena: usuarioEmpleado.contrasena,
      usuario: usuarioEmpleado.usuario,
      email: usuarioEmpleado.email,
      hotelId: usuarioEmpleado.hotelId
    };
    
    console.log('Creando usuario empleado en:', `${this.apiUsuariosEmpleadosUrl}/crear`);
    return this.http.post<UsuarioEmpleadoResponse>(
      `${this.apiUsuariosEmpleadosUrl}/crear`, 
      requestDTO, 
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar usuario normal
  update(id: number, usuario: any): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/${id}`, usuario, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar usuario normal
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar usuario empleado
  updateUsuarioEmpleado(idUsuario: number, usuarioEmpleado: any): Observable<UsuarioEmpleadoResponse> {
    return this.http.put<UsuarioEmpleadoResponse>(
      `${this.apiUsuariosEmpleadosUrl}/editar/${idUsuario}`, 
      usuarioEmpleado, 
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar usuario empleado
  deleteUsuarioEmpleado(idUsuario: number): Observable<any> {
    return this.http.delete(`${this.apiUsuariosEmpleadosUrl}/eliminar/${idUsuario}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener usuario empleado por ID
  getUsuarioEmpleadoById(idUsuario: number): Observable<UsuarioEmpleadoResponse> {
    return this.http.get<UsuarioEmpleadoResponse>(`${this.apiUsuariosEmpleadosUrl}/${idUsuario}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener todos los usuarios empleados
  getAllUsuariosEmpleados(): Observable<UsuarioEmpleadoResponse[]> {
    return this.http.get<UsuarioEmpleadoResponse[]>(`${this.apiUsuariosEmpleadosUrl}/todos`, this.httpOptions).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(this.handleError)
    );
  }

  // Métodos para empleados
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiEmpleadosUrl}/Listar`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  createEmpleado(empleado: any): Observable<any> {
    return this.http.post(`${this.apiEmpleadosUrl}/Crear`, empleado, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private safeMapResponse(response: any): any[] {
    if (response === null || response === undefined) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (typeof response === 'object') {
      return [response];
    }
    return [];
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido en el servicio de usuarios';
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3333';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Error en los datos enviados. Verifica el formato de los campos.';
    } else if (error.status === 404) {
      errorMessage = `El endpoint ${error.url} no existe. Verifica la URL en el backend.`;
    } else if (error.status === 500) {
      errorMessage = error.error?.message || 'Error interno del servidor. Revisa los logs del backend.';
    } else {
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    
    console.error('Error en UsuarioService:', error);
    return throwError(() => new Error(errorMessage));
  }
}