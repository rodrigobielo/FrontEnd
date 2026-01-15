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
  usuarioNombre: string = 'Ana García';
  usuarioEmail: string = 'ana@email.com';
  usuarioIniciales: string = 'AG';
  
  tieneNotificaciones: boolean = true;
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
    const usuarioMock = {
      logueado: false,
      nombre: 'Ana García',
      email: 'ana@email.com'
    };
    
    this.usuarioLogueado = usuarioMock.logueado;
    
    if (usuarioMock.logueado) {
      this.usuarioNombre = usuarioMock.nombre;
      this.usuarioEmail = usuarioMock.email;
      this.usuarioIniciales = this.obtenerIniciales(usuarioMock.nombre);
    }
  }
  
  obtenerIniciales(nombreCompleto: string): string {
    return nombreCompleto
      .split(' ')
      .map(nombre => nombre[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  cerrarSesion(): void {
    this.usuarioLogueado = false;
    this.usuarioNombre = '';
    this.usuarioEmail = '';
    this.usuarioIniciales = '';
    this.tieneNotificaciones = false;
    
    console.log('Sesión cerrada exitosamente');
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
  
  simularLogin(): void {
    this.usuarioLogueado = true;
    this.usuarioNombre = 'Ana García';
    this.usuarioIniciales = 'AG';
    this.tieneNotificaciones = true;
    
    console.log('Login simulado exitosamente');
  }
  
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
}