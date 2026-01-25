import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  summaryCards = [
    { title: 'Regiones', count: 24, change: 12, icon: 'globe-americas', color: 'primary' },
    { title: 'Provincias', count: 196, change: 8, icon: 'map', color: 'success' },
    { title: 'Ciudades', count: 842, change: 5, icon: 'building', color: 'info' },
    { title: 'Hoteles', count: 1254, change: -3, icon: 'house-door', color: 'warning' },
    { title: 'Categorías', count: 8, change: 15, icon: 'tags', color: 'danger' },
    { title: 'Usuarios', count: 42, change: 10, icon: 'people', color: 'secondary' }
  ];

  currentUser: any = null;
  currentDate: Date = new Date();
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { 
    console.log('DashboardComponent inicializado');
  }

  ngOnInit(): void {
    console.log('DashboardComponent.ngOnInit()');
    this.verifyAccess();
  }

  private verifyAccess(): void {
    console.log('Verificando acceso al dashboard...');
    this.loading = true;
    
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario NO autenticado, redirigiendo a login');
      this.errorMessage = 'No autenticado. Redirigiendo al login...';
      this.router.navigate(['/login'], {
        queryParams: { redirect: 'dashboard' }
      });
      return;
    }

    // Obtener usuario actual
    const user = this.authService.getCurrentUser();
    console.log('Usuario obtenido en dashboard:', user);
    
    if (!user) {
      console.log('Usuario no encontrado, redirigiendo a login');
      this.errorMessage = 'Usuario no encontrado. Redirigiendo...';
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    // Verificar rol (superAdmin o admin)
    if (!this.isSuperAdmin(user.rol)) {
      console.log('Usuario sin permisos de superAdmin. Rol:', user.rol);
      this.errorMessage = 'Acceso denegado. Se requiere rol de SuperAdmin para acceder al dashboard.';
      this.loading = false;
      
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }

    // Usuario válido
    this.currentUser = user;
    this.loading = false;
    console.log('Dashboard cargado para usuario:', this.currentUser);
  }

  private isSuperAdmin(rol: string): boolean {
    const rolLower = rol?.toLowerCase() || '';
    const esSuperAdmin = rolLower.includes('superadmin') || 
           rolLower === 'super_admin' || 
           rolLower.includes('administrador') ||
           rolLower === 'admin';
    
    console.log(`Verificando si ${rolLower} es superAdmin: ${esSuperAdmin}`);
    return esSuperAdmin;
  }

  ngAfterViewInit(): void {
    if (this.currentUser) {
      console.log('Mostrando modal de bienvenida para:', this.currentUser.nombre);
      setTimeout(() => {
        this.showWelcomeModal();
      }, 1000);
    }
  }

  private showWelcomeModal(): void {
    const modalAlreadyShown = sessionStorage.getItem('welcomeModalShown');
    
    if (modalAlreadyShown === 'true') {
      console.log('Modal ya mostrado anteriormente');
      return;
    }
    
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
      console.log('Mostrando modal de bienvenida');
      const modal = new (window as any).bootstrap.Modal(modalElement);
      
      sessionStorage.setItem('welcomeModalShown', 'true');
      modal.show();
    } else {
      console.log('Elemento modal no encontrado en el DOM');
    }
  }

  onAddClick(cardType: string): void {
    console.log(`Añadir nuevo ${cardType}`);
    // Redirigir según el tipo
    switch(cardType) {
      case 'Regiones':
        this.router.navigate(['/regiones/nueva']);
        break;
      case 'Provincias':
        this.router.navigate(['/provincias/nueva']);
        break;
      case 'Ciudades':
        this.router.navigate(['/ciudades/nueva']);
        break;
      case 'Hoteles':
        this.router.navigate(['/hoteles/nuevo']);
        break;
      case 'Categorías':
        this.router.navigate(['/categorias/nueva']);
        break;
      case 'Usuarios':
        this.router.navigate(['/usuarios/nuevo']);
        break;
      default:
        console.log(`Tipo no reconocido: ${cardType}`);
    }
  }

  onListClick(cardType: string): void {
    console.log(`Ver lista de ${cardType}`);
    // Redirigir según el tipo
    switch(cardType) {
      case 'Regiones':
        this.router.navigate(['/regiones']);
        break;
      case 'Provincias':
        this.router.navigate(['/provincias']);
        break;
      case 'Ciudades':
        this.router.navigate(['/ciudades']);
        break;
      case 'Hoteles':
        this.router.navigate(['/hoteles']);
        break;
      case 'Categorías':
        this.router.navigate(['/categorias']);
        break;
      case 'Usuarios':
        this.router.navigate(['/usuarios']);
        break;
      default:
        console.log(`Tipo no reconocido: ${cardType}`);
    }
  }

  getChangeBadgeClass(change: number): string {
    return change >= 0 ? 'bg-success' : 'bg-danger';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'arrow-up' : 'arrow-down';
  }

  cerrarSesion(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      console.log('Confirmado cerrar sesión');
      this.authService.logout();
    } else {
      console.log('Cancelado cerrar sesión');
    }
  }
}