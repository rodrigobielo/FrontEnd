// auth.service.ts
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
  private currentHotelSubject = new BehaviorSubject<any>(null);
  public currentHotel$ = this.currentHotelSubject.asObservable();
  private currentHotelId: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
    this.loadStoredHotel();
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
    
    // Si es admin hotel, obtener su hotel asignado usando getHotelInfoById
    if (this.isAdminHotel() && response.usuario.hotelId) {
      this.currentHotelId = response.usuario.hotelId;
      this.cargarHotelAsignado(response.usuario.hotelId, rememberMe);
    } else {
      // Redirigir según rol
      this.redirectByRole(response.usuario.rol);
    }
  }

  private cargarHotelAsignado(hotelId: number, rememberMe: boolean): void {
    // Usar el método getHotelInfoById del backend
    this.apiService.getHotelInfoById(hotelId).subscribe({
      next: (hotel: any) => {
        console.log('Hotel recibido del backend:', hotel);
        
        const hotelData = {
          id: hotel.id,
          nombre: hotel.nombre,
          direccion: hotel.direccion || '',
          telefono: hotel.telefono || '',
          email: hotel.email || ''
        };
        
        // Guardar en storage según la preferencia
        if (rememberMe) {
          localStorage.setItem('current_hotel', JSON.stringify(hotelData));
        } else {
          sessionStorage.setItem('current_hotel', JSON.stringify(hotelData));
        }
        
        this.currentHotelSubject.next(hotelData);
        this.currentHotelId = hotelId;
        
        // Redirigir después de cargar el hotel
        const user = this.getCurrentUser();
        this.redirectByRole(user?.rol);
      },
      error: (error) => {
        console.error('Error al cargar el hotel del administrador:', error);
        // Aún así redirigir para no bloquear el login
        const user = this.getCurrentUser();
        this.redirectByRole(user?.rol);
      }
    });
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

  // MÉTODOS DE VERIFICACIÓN
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getCurrentHotel(): any {
    return this.currentHotelSubject.value;
  }

  getCurrentHotelId(): number | null {
    if (this.currentHotelId) {
      return this.currentHotelId;
    }
    
    const user = this.getCurrentUser();
    if (user && user.rol?.toLowerCase() === 'adminhotel' && user.hotelId) {
      return user.hotelId;
    }
    
    return null;
  }

  getNombreHotel(): string {
    const hotel = this.getCurrentHotel();
    if (hotel && hotel.nombre) {
      return hotel.nombre;
    }
    return 'Hotel sin especificar';
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
    this.currentHotelSubject.next(null);
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
        
        if (user && user.rol?.toLowerCase() === 'adminhotel' && user.hotelId) {
          this.currentHotelId = user.hotelId;
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario almacenado:', error);
      this.clearStorage();
    }
  }

  private loadStoredHotel(): void {
    try {
      let hotelStr = localStorage.getItem('current_hotel');
      
      if (!hotelStr) {
        hotelStr = sessionStorage.getItem('current_hotel');
      }
      
      if (hotelStr) {
        const hotel = JSON.parse(hotelStr);
        this.currentHotelSubject.next(hotel);
        if (hotel && hotel.id) {
          this.currentHotelId = hotel.id;
        }
      }
    } catch (error) {
      console.error('Error al cargar hotel almacenado:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_hotel');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('current_hotel');
  }

  // Método para actualizar los datos del hotel
  actualizarHotel(hotelData: any): void {
    this.currentHotelSubject.next(hotelData);
    
    const rememberMe = !!localStorage.getItem('current_hotel');
    if (rememberMe) {
      localStorage.setItem('current_hotel', JSON.stringify(hotelData));
    } else {
      sessionStorage.setItem('current_hotel', JSON.stringify(hotelData));
    }
    
    if (hotelData && hotelData.id) {
      this.currentHotelId = hotelData.id;
    }
  }

  // Método para recargar los datos del hotel desde el servidor
  recargarHotel(): Observable<any> {
    const hotelId = this.getCurrentHotelId();
    if (hotelId) {
      return this.apiService.getHotelInfoById(hotelId);
    }
    return throwError(() => new Error('No hay hotel asignado'));
  }
}