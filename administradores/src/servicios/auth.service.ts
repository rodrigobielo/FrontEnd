// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
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
  private currentEmpleadoSubject = new BehaviorSubject<any>(null);
  public currentEmpleado$ = this.currentEmpleadoSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
    this.loadStoredHotel();
    this.loadStoredEmpleado();
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
      this.cargarEmpleadoAsignado(response.usuario.id, rememberMe);
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
          descripcion: hotel.descripcion || '',
          direccion: hotel.direccion || '',
          contactos: hotel.contactos || '',
          telefono: hotel.telefono || '',
          email: hotel.email || '',
          ciudades: hotel.ciudades || null,
          categorias: hotel.categorias || null
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

  private cargarEmpleadoAsignado(usuarioId: number, rememberMe: boolean): void {
    // Obtener el empleado asociado al usuario
    this.apiService.getEmpleadoByUsuarioId(usuarioId).subscribe({
      next: (empleado: any) => {
        console.log('Empleado recibido del backend:', empleado);
        
        const empleadoData = {
          idEmpleado: empleado.idEmpleado,
          rolEmpleado: empleado.rolEmpleado,
          usuario: empleado.usuario,
          hotel: empleado.hotel
        };
        
        // Guardar en storage según la preferencia
        if (rememberMe) {
          localStorage.setItem('current_empleado', JSON.stringify(empleadoData));
        } else {
          sessionStorage.setItem('current_empleado', JSON.stringify(empleadoData));
        }
        
        this.currentEmpleadoSubject.next(empleadoData);
        
        // Si el hotel no está cargado aún, cargarlo desde el empleado
        if (!this.currentHotelId && empleado.hotel) {
          const hotelData = {
            id: empleado.hotel.id,
            nombre: empleado.hotel.nombre,
            descripcion: empleado.hotel.descripcion || '',
            contactos: empleado.hotel.contactos || '',
            telefono: empleado.hotel.telefono || '',
            email: empleado.hotel.email || ''
          };
          
          if (rememberMe) {
            localStorage.setItem('current_hotel', JSON.stringify(hotelData));
          } else {
            sessionStorage.setItem('current_hotel', JSON.stringify(hotelData));
          }
          
          this.currentHotelSubject.next(hotelData);
          this.currentHotelId = empleado.hotel.id;
        }
      },
      error: (error) => {
        console.error('Error al cargar el empleado:', error);
      }
    });
  }

  // NUEVO MÉTODO: Obtener empleado con hotel
  getEmpleadoConHotel(): Observable<any> {
    const usuarioId = this.getCurrentUserId();
    if (!usuarioId) {
      return throwError(() => new Error('No hay usuario logueado'));
    }
    
    return this.apiService.getEmpleadoByUsuarioId(usuarioId).pipe(
      map((empleado: any) => {
        if (empleado && empleado.idEmpleado) {
          // Actualizar el empleado en el subject
          this.currentEmpleadoSubject.next(empleado);
          
          // Si el empleado tiene hotel, actualizarlo también
          if (empleado.hotel && empleado.hotel.id) {
            const hotelData = {
              id: empleado.hotel.id,
              nombre: empleado.hotel.nombre,
              descripcion: empleado.hotel.descripcion || '',
              contactos: empleado.hotel.contactos || '',
              telefono: empleado.hotel.telefono || '',
              email: empleado.hotel.email || '',
              ciudades: empleado.hotel.ciudades,
              categorias: empleado.hotel.categorias
            };
            
            this.currentHotelSubject.next(hotelData);
            this.currentHotelId = empleado.hotel.id;
            
            // Guardar en storage
            const rememberMe = !!localStorage.getItem('current_hotel');
            if (rememberMe) {
              localStorage.setItem('current_hotel', JSON.stringify(hotelData));
            } else {
              sessionStorage.setItem('current_hotel', JSON.stringify(hotelData));
            }
          }
        }
        return empleado;
      }),
      catchError(error => {
        console.error('Error al obtener empleado con hotel:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener solo el empleado actual
  getCurrentEmpleado(): any {
    return this.currentEmpleadoSubject.value;
  }

  // Obtener el ID del empleado actual
  getCurrentEmpleadoId(): number | null {
    const empleado = this.getCurrentEmpleado();
    return empleado ? empleado.idEmpleado : null;
  }

  // Obtener el ID del usuario actual
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
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
    
    const empleado = this.getCurrentEmpleado();
    if (empleado && empleado.hotel && empleado.hotel.id) {
      return empleado.hotel.id;
    }
    
    return null;
  }

  getNombreHotel(): string {
    const hotel = this.getCurrentHotel();
    if (hotel && hotel.nombre) {
      return hotel.nombre;
    }
    
    const empleado = this.getCurrentEmpleado();
    if (empleado && empleado.hotel && empleado.hotel.nombre) {
      return empleado.hotel.nombre;
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
    this.currentEmpleadoSubject.next(null);
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

  private loadStoredEmpleado(): void {
    try {
      let empleadoStr = localStorage.getItem('current_empleado');
      
      if (!empleadoStr) {
        empleadoStr = sessionStorage.getItem('current_empleado');
      }
      
      if (empleadoStr) {
        const empleado = JSON.parse(empleadoStr);
        this.currentEmpleadoSubject.next(empleado);
      }
    } catch (error) {
      console.error('Error al cargar empleado almacenado:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_hotel');
    localStorage.removeItem('current_empleado');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('current_hotel');
    sessionStorage.removeItem('current_empleado');
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

  // Método para actualizar los datos del empleado
  actualizarEmpleado(empleadoData: any): void {
    this.currentEmpleadoSubject.next(empleadoData);
    
    const rememberMe = !!localStorage.getItem('current_empleado');
    if (rememberMe) {
      localStorage.setItem('current_empleado', JSON.stringify(empleadoData));
    } else {
      sessionStorage.setItem('current_empleado', JSON.stringify(empleadoData));
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

  // Método para recargar los datos del empleado desde el servidor
  recargarEmpleado(): Observable<any> {
    const usuarioId = this.getCurrentUserId();
    if (usuarioId) {
      return this.apiService.getEmpleadoByUsuarioId(usuarioId);
    }
    return throwError(() => new Error('No hay usuario logueado'));
  }
}