import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio implements OnInit {
  usuario: any = null;
  isLoggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Inicio ngOnInit - Verificando autenticación...');
    this.verificarAutenticacion();
  }

  verificarAutenticacion(): void {
    this.usuario = this.authService.getUsuarioActual();
    this.isLoggedIn = this.authService.isAuthenticated();
    
    console.log('Usuario actual:', this.usuario);
    console.log('¿Está autenticado?', this.isLoggedIn);
    console.log('Usuario desde localStorage:', localStorage.getItem('usuarioTurismo'));
  }

  // Método para obtener iniciales del usuario para el avatar
  getUsuarioIniciales(): string {
    if (!this.usuario || !this.usuario.nombre) return 'U';
    
    const nombre = this.usuario.nombre;
    const partes = nombre.split(' ');
    
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    } else if (nombre.length >= 2) {
      return nombre.substring(0, 2).toUpperCase();
    } else {
      return nombre.charAt(0).toUpperCase();
    }
  }

  onCerrarSesion(): void {
    console.log('Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irAReservas(): void {
    console.log('Navegando a reservas...');
    if (this.isLoggedIn) {
      this.router.navigate(['/reservas']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  irAPerfil(): void {
    console.log('Navegando a perfil...');
    if (this.isLoggedIn) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  irANuevaReserva(): void {
    console.log('Navegando a nueva reserva...');
    if (this.isLoggedIn) {
      this.router.navigate(['/nueva-reserva']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}