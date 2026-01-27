import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  usuarioLogueado: boolean = false;
  usuarioNombre: string = '';
  usuarioEmail: string = '';
  
  isMobile: boolean = false;

  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.verificarAutenticacion();
    this.verificarTamanoPantalla();
    window.addEventListener('resize', () => this.verificarTamanoPantalla());
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.verificarTamanoPantalla());
  }
  
  verificarTamanoPantalla(): void {
    this.isMobile = window.innerWidth < 992;
  }
  
  verificarAutenticacion(): void {
    const usuarioGuardado = localStorage.getItem('usuarioTurismo');
    
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioLogueado = true;
        this.usuarioNombre = usuario.nombre;
        this.usuarioEmail = usuario.email;
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        this.cerrarSesion();
      }
    } else {
      this.cerrarSesion();
    }
  }
  
  cerrarSesion(): void {
    localStorage.removeItem('usuarioTurismo');
    this.router.navigate(['/login']);
  }
  
  // Navegación
  onMostrarInicio(): void {
    this.router.navigate(['/inicio']);
    this.cerrarMenuMobile();
  }
  
  onMostrarHoteles(): void {
    this.router.navigate(['/hoteles']);
    this.cerrarMenuMobile();
  }
  
  onMostrarContactos(): void {
    this.router.navigate(['/contactos']);
    this.cerrarMenuMobile();
  }
  
  onMostrarReservas(): void {
    this.router.navigate(['/reservas']);
    this.cerrarMenuMobile();
  }
  
  cerrarMenuMobile(): void {
    if (this.isMobile) {
      const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
      if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
        navbarToggler.click();
      }
    }
  }
}