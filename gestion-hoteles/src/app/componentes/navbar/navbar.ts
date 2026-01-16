import { Component, OnInit, HostListener, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Registro } from '../registro/registro';
import { Login } from '../login/login';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, Registro, Login],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  // Outputs para todas las secciones
  @Output() mostrarInicio = new EventEmitter<void>();
  @Output() mostrarHoteles = new EventEmitter<void>();
  @Output() mostrarContactos = new EventEmitter<void>();
  
  usuarioLogueado: boolean = false;
  usuarioNombre: string = '';
  usuarioEmail: string = '';
  usuarioIniciales: string = '';
  
  tieneNotificaciones: boolean = false;
  notificaciones = [
    {
      id: 1,
      mensaje: 'Tu reserva ha sido confirmada exitosamente',
      tiempo: 'Hace 2 horas'
    },
    {
      id: 2,
      mensaje: 'Nuevas ofertas disponibles en hoteles de playa',
      tiempo: 'Hace 1 día'
    },
    {
      id: 3,
      mensaje: 'Recordatorio: Check-in mañana a las 14:00',
      tiempo: 'Hace 2 días'
    }
  ];
  
  isMobile: boolean = false;
  mostrarLoginForm: boolean = false;
  mostrarRegistroForm: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit(): void {
    this.verificarAutenticacion();
    
    if (isPlatformBrowser(this.platformId)) {
      this.verificarTamanoPantalla();
      window.addEventListener('resize', () => this.verificarTamanoPantalla());
    }
  }
  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', () => this.verificarTamanoPantalla());
    }
  }
  
  verificarTamanoPantalla(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 992;
    }
  }
  
  verificarAutenticacion(): void {
    // Verificar si hay datos de usuario en localStorage
    if (isPlatformBrowser(this.platformId)) {
      const usuarioGuardado = localStorage.getItem('usuarioTurismo');
      
      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          this.usuarioLogueado = true;
          this.usuarioNombre = usuario.nombre;
          this.usuarioEmail = usuario.email;
          this.usuarioIniciales = this.obtenerIniciales(usuario.nombre);
          this.tieneNotificaciones = true;
          console.log('🔐 Usuario recuperado de localStorage:', usuario);
        } catch (error) {
          console.error('Error al parsear usuario:', error);
          this.limpiarSesion();
        }
      } else {
        console.log('🔐 No hay usuario en localStorage');
        this.limpiarSesion();
      }
    }
  }
  
  obtenerIniciales(nombreCompleto: string): string {
    if (!nombreCompleto) return '';
    return nombreCompleto
      .split(' ')
      .map(nombre => nombre[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  cerrarSesion(): void {
    this.limpiarSesion();
    
    // Redirigir a inicio
    this.mostrarInicio.emit();
    
    console.log('🚪 Sesión cerrada exitosamente - Redirigiendo a Inicio');
  }
  
  limpiarSesion(): void {
    // Limpiar datos de autenticación
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioTurismo');
    }
    
    // Resetear estado del componente
    this.usuarioLogueado = false;
    this.usuarioNombre = '';
    this.usuarioEmail = '';
    this.usuarioIniciales = '';
    this.tieneNotificaciones = false;
  }
  
  // Método para manejar login exitoso desde el componente Login
  onLoginExitoso(usuario: any): void {
    console.log('✅ LOGIN EXITOSO en Navbar:', usuario);
    
    this.usuarioLogueado = true;
    this.usuarioNombre = usuario.nombre;
    this.usuarioEmail = usuario.email;
    this.usuarioIniciales = this.obtenerIniciales(usuario.nombre);
    this.tieneNotificaciones = true;
    
    // Guardar en localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuarioTurismo', JSON.stringify(usuario));
      console.log('💾 Usuario guardado en localStorage');
    }
    
    // Cerrar modal
    this.onOcultarLogin();
    
    // Emitir evento para redirigir si es necesario
    this.mostrarInicio.emit();
  }
  
  // Método para manejar registro exitoso desde el componente Registro
  onRegistroExitoso(usuario: any): void {
    console.log('✅ REGISTRO EXITOSO en Navbar:', usuario);
    
    this.usuarioLogueado = true;
    this.usuarioNombre = usuario.nombre;
    this.usuarioEmail = usuario.email;
    this.usuarioIniciales = this.obtenerIniciales(usuario.nombre);
    this.tieneNotificaciones = true;
    
    // Guardar en localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuarioTurismo', JSON.stringify(usuario));
    }
    
    // Cerrar modal
    this.onOcultarRegistro();
    
    // Emitir evento para redirigir si es necesario
    this.mostrarInicio.emit();
  }
  
  // Métodos para cambiar secciones
  onMostrarInicio(): void {
    console.log('🔵 NAVBAR: Mostrando Inicio');
    this.mostrarInicio.emit();
    this.cerrarMenuMobile();
  }
  
  onMostrarHoteles(): void {
    console.log('🔵 NAVBAR: Mostrando Hoteles');
    this.mostrarHoteles.emit();
    this.cerrarMenuMobile();
  }
  
  onMostrarContactos(): void {
    console.log('🔵 NAVBAR: Mostrando Contactos');
    this.mostrarContactos.emit();
    this.cerrarMenuMobile();
  }
  
  cerrarMenuMobile(): void {
    if (isPlatformBrowser(this.platformId) && this.isMobile) {
      const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
      if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
        navbarToggler.click();
      }
    }
  }
  
  // Métodos para mostrar/ocultar modales
  onMostrarLogin(): void {
    this.mostrarLoginForm = true;
    this.mostrarRegistroForm = false;
    this.cerrarMenuMobile();
  }
  
  onOcultarLogin(): void {
    this.mostrarLoginForm = false;
  }
  
  onMostrarRegistro(): void {
    this.mostrarRegistroForm = true;
    this.mostrarLoginForm = false;
    this.cerrarMenuMobile();
  }
  
  onOcultarRegistro(): void {
    this.mostrarRegistroForm = false;
  }
  
  // Método para pruebas rápidas
  simularLoginRapido(): void {
    const usuarioMock = {
      nombre: 'Rodrigo García',
      email: 'rodrigo@email.com'
    };
    this.onLoginExitoso(usuarioMock);
  }
}