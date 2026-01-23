import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL de tu backend Spring Boot - Ajusta según tu configuración
  private apiUrl = 'http://localhost:8765'; // Puerto del gateway Spring Boot

  constructor(private http: HttpClient) { }

  // MÉTODO DE LOGIN - Busca en todos los usuarios
  login(credentials: any): Observable<any> {
    console.log('Buscando usuario:', credentials.nombre);
    
    // Primero obtenemos todos los usuarios
    return this.http.get<any[]>(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        map(usuarios => {
          console.log('Usuarios recibidos del backend:', usuarios);
          
          // Buscar usuario que coincida con nombre y contraseña
          const usuarioEncontrado = usuarios.find(user => 
            user.nombre === credentials.nombre && 
            user.contrasena === credentials.contrasena
          );
          
          if (usuarioEncontrado) {
            console.log('Usuario encontrado:', usuarioEncontrado);
            
            // Simular respuesta de autenticación exitosa
            const response = {
              token: this.generateMockToken(usuarioEncontrado),
              usuario: {
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre,
                apellidos: usuarioEncontrado.apellidos,
                telefono: usuarioEncontrado.telefono,
                nacionalidad: usuarioEncontrado.nacionalidad,
                numPasaporte: usuarioEncontrado.numPasaporte,
                rol: usuarioEncontrado.rol,
                username: usuarioEncontrado.nombre // Para compatibilidad
              },
              mensaje: 'Login exitoso',
              expiracion: Date.now() + 3600000 // 1 hora
            };
            
            console.log('Respuesta de login simulada:', response);
            return response;
          } else {
            console.log('Usuario NO encontrado con esas credenciales');
            throw { 
              status: 401, 
              message: 'Credenciales inválidas. Nombre de usuario o contraseña incorrectos.' 
            };
          }
        }),
        catchError(this.handleError)
      );
  }

  // Generar un token mock para desarrollo
  private generateMockToken(user: any): string {
    const mockData = {
      userId: user.id,
      username: user.nombre,
      role: user.rol,
      timestamp: Date.now(),
      exp: Date.now() + 3600000
    };
    // Base64 encode para simular token JWT
    return 'mock-jwt.' + btoa(JSON.stringify(mockData));
  }

  // Métodos CRUD existentes para usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        tap(usuarios => console.log('Lista de usuarios recibida:', usuarios)),
        catchError(this.handleError)
      );
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Usuarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Usuarios/Crear`, usuario)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Usuarios/${id}`, usuario)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Usuarios/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Verificar conexión con el backend
  verificarConexion(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/Usuarios/Listar`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ApiService:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
      console.error('Error de cliente:', errorMessage);
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'Error de conexión con el servidor. Verifique:';
          errorMessage += '\n1. Que Spring Boot esté corriendo en puerto 8765';
          errorMessage += '\n2. Que el servidor no tenga problemas de CORS';
          errorMessage += '\n3. Que la red no esté bloqueando la conexión';
          break;
        case 400:
          errorMessage = error.error?.mensaje || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = error.error?.mensaje || 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado. Verifique la URL: ' + error.url;
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => ({ 
      status: error.status, 
      message: errorMessage,
      originalError: error,
      url: error.url
    }));
  }
}