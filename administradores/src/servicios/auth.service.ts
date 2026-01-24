import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private currentHotelId: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  // MÉTODOS DE AUTENTICACIÓN
  login(credentials: any): Observable<any> {
    return this.apiService.login(credentials)
      .pipe(
        tap(response => {
          this.handleLoginResponse(response, credentials.rememberMe);
        }),
        catchError(error => {
          console.error('Error en AuthService.login:', error);
          return throwError(() => error);
        })
      );
  }

  private handleLoginResponse(response: any, rememberMe: boolean = false): void {
    // Guardar datos según preferencia
    if (rememberMe) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.usuario));
    } else {
      sessionStorage.setItem('auth_token', response.token);
      sessionStorage.setItem('current_user', JSON.stringify(response.usuario));
    }

    this.currentUserSubject.next(response.usuario);
    
    // Redirigir según rol
    this.redirectByRole(response.usuario.rol);
  }

  redirectByRole(rol: string): void {
    const rolLower = rol?.toLowerCase() || '';
    
    if (rolLower === 'superadmin') {
      this.router.navigate(['/dashboard']);
    } else if (rolLower === 'adminhotel') {
      this.router.navigate(['/dashboard-hotel']);
    } else {
      this.router.navigate(['/perfil']);
    }
  }

  // MÉTODOS DE VERIFICACIÓN - CORREGIDOS (eliminar los null)
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getCurrentHotelId(): number | null {
    return this.currentHotelId;
  }

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.rol) {
      return false;
    }
    return user.rol.toLowerCase() === 'superadmin';
  }

  isAdminHotel(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.rol) {
      return false;
    }
    return user.rol.toLowerCase() === 'adminhotel';
  }

  // MÉTODOS DE GESTIÓN DE SESIÓN
  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.currentHotelId = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  private loadStoredUser(): void {
    try {
      let userStr = localStorage.getItem('current_user');
      let token = localStorage.getItem('auth_token');
      
      if (!userStr || !token) {
        userStr = sessionStorage.getItem('current_user');
        token = sessionStorage.getItem('auth_token');
      }
      
      if (userStr && token) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Error al cargar usuario almacenado:', error);
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
  }
}