import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Credentials } from '../modelos/credentials.model';
import { AuthResponse } from '../modelos/auth-response.model';
import { User } from '../modelos/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private conexionVerificada = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    console.log('AuthService inicializado');
    this.verificarConexionBackend();
    this.loadStoredUser();
  }

  // Verificar conexión con backend
  private verificarConexionBackend(): void {
    console.log('Verificando conexión con backend...');
    this.apiService.verificarConexion().subscribe({
      next: (conectado) => {
        this.conexionVerificada = conectado;
        console.log('Backend conectado:', conectado);
      },
      error: (error) => {
        console.error('Error al verificar conexión:', error);
        this.conexionVerificada = false;
      }
    });
  }

  // Login usando el método del ApiService
  login(credentials: Credentials): Observable<AuthResponse> {
    console.log('AuthService.login() llamado con:', credentials);
    
    if (!this.conexionVerificada) {
      console.warn('Backend no está conectado, intentando reconectar...');
      this.verificarConexionBackend();
    }
    
    return this.apiService.login(credentials)
      .pipe(
        tap(response => {
          console.log('Respuesta de login recibida en AuthService:', response);
          this.handleLoginResponse(response, credentials.rememberMe || false);
        }),
        catchError(error => {
          console.error('Error en AuthService.login:', error);
          let errorMessage = 'Error en la autenticación';
          
          if (error.status === 0) {
            errorMessage = `
              Error de conexión con el servidor.
              Verifique que:
              1. Spring Boot esté ejecutándose en puerto 8765
              2. No haya problemas de CORS
              3. La URL http://localhost:8765/Usuarios/Listar sea accesible
              
              Detalles: ${error.message}
            `;
          } else if (error.status === 401) {
            errorMessage = 'Nombre de usuario o contraseña incorrectos.';
          } else if (error.status === 404) {
            errorMessage = `Endpoint no encontrado: ${error.url}`;
          }
          
          return throwError(() => ({ 
            status: error.status, 
            message: errorMessage,
            originalError: error 
          }));
        })
      );
  }

  private handleLoginResponse(response: AuthResponse, rememberMe: boolean = false): void {
    console.log('Procesando respuesta de login...');
    
    // Validar respuesta
    if (!response || !response.usuario) {
      console.error('Respuesta inválida del backend:', response);
      throw new Error('Respuesta de autenticación inválida');
    }

    // Validar que el usuario tenga rol
    if (!response.usuario.rol) {
      console.warn('Usuario sin rol definido:', response.usuario);
      response.usuario.rol = 'usuario'; // Rol por defecto
    }

    // Guardar según preferencia de persistencia
    if (rememberMe) {
      localStorage.setItem('auth_token', response.token || '');
      localStorage.setItem('current_user', JSON.stringify(response.usuario));
      console.log('Datos guardados en localStorage');
    } else {
      sessionStorage.setItem('auth_token', response.token || '');
      sessionStorage.setItem('current_user', JSON.stringify(response.usuario));
      console.log('Datos guardados en sessionStorage');
    }

    // Actualizar estado del usuario
    this.currentUserSubject.next(response.usuario);
    console.log('Usuario actual establecido:', response.usuario);

    // Redirigir según rol
    this.redirectByRole(response.usuario.rol);
  }

  redirectByRole(rol: string): void {
    console.log('Redirigiendo según rol:', rol);
    
    const rolLower = rol?.toLowerCase() || '';
    
    // Verificar si es admin/superadmin
    if (rolLower.includes('superadmin') || 
        rolLower.includes('administrador') || 
        rolLower.includes('admin')) {
      
      console.log('Usuario tiene permisos de admin, redirigiendo a dashboard...');
      
      // Usar navegación normal primero
      this.router.navigate(['/dashboard'])
        .then(success => {
          if (success) {
            console.log('Redirección exitosa a dashboard');
          } else {
            console.error('No se pudo redirigir a dashboard. Verificando rutas...');
            // Fallback: usar window.location
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
          }
        })
        .catch(error => {
          console.error('Error crítico en redirección:', error);
          // Fallback inmediato
          window.location.href = '/dashboard';
        });
    } else {
      console.log('Usuario sin permisos de admin, redirigiendo a perfil...');
      this.router.navigate(['/perfil']);
    }
  }

  private loadStoredUser(): void {
    try {
      let userStr = localStorage.getItem('current_user');
      let token = localStorage.getItem('auth_token');
      
      // Si no hay en localStorage, buscar en sessionStorage
      if (!userStr) {
        userStr = sessionStorage.getItem('current_user');
        token = sessionStorage.getItem('auth_token');
      }
      
      if (userStr) {
        const user: User = JSON.parse(userStr);
        console.log('Usuario cargado de almacenamiento:', user);
        this.currentUserSubject.next(user);
      } else {
        console.log('No hay usuario almacenado');
      }
    } catch (error) {
      console.error('Error al cargar usuario almacenado:', error);
      this.clearStorage();
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = this.getToken();
    const autenticado = !!(user && token);
    console.log('isAuthenticated:', autenticado, 'Usuario:', user);
    return autenticado;
  }

  hasRole(roles: string | string[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.rol) {
      console.log('No hay usuario o rol para verificar');
      return false;
    }

    const userRole = currentUser.rol.toLowerCase();
    const requiredRoles = Array.isArray(roles) 
      ? roles.map(r => r.toLowerCase())
      : [roles.toLowerCase()];

    const tieneRol = requiredRoles.some(role => userRole.includes(role));
    console.log(`Verificando rol ${userRole} contra ${requiredRoles}: ${tieneRol}`);
    return tieneRol;
  }

  logout(): void {
    console.log('Cerrando sesión...');
    const currentUser = this.getCurrentUser();
    
    this.clearStorage();
    this.currentUserSubject.next(null);
    
    // Limpiar modal de bienvenida
    sessionStorage.removeItem('welcomeModalShown');
    
    console.log('Redirigiendo a login...');
    this.router.navigate(['/login'])
      .then(success => {
        if (!success) {
          window.location.href = '/login';
        }
      });
    
    // Log para debug
    if (currentUser) {
      console.log(`Sesión cerrada para usuario: ${currentUser.nombre}`);
    }
  }

  private clearStorage(): void {
    // Limpiar todos los almacenamientos relacionados con auth
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('rememberedUser');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.rol) {
      console.log('Usuario no tiene rol definido');
      return false;
    }
    
    const role = user.rol.toLowerCase();
    const esSuperAdmin = role.includes('superadmin') || role.includes('administrador');
    console.log(`isSuperAdmin para rol ${role}: ${esSuperAdmin}`);
    return esSuperAdmin;
  }

  // Método para debug
  debugEstado(): void {
    console.log('=== DEBUG AuthService ===');
    console.log('Usuario actual:', this.getCurrentUser());
    console.log('Token:', this.getToken());
    console.log('Autenticado:', this.isAuthenticated());
    console.log('Backend conectado:', this.conexionVerificada);
    console.log('LocalStorage user:', localStorage.getItem('current_user'));
    console.log('SessionStorage user:', sessionStorage.getItem('current_user'));
    console.log('=========================');
  }
}