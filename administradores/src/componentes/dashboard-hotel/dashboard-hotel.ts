import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-dashboard-hotel',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    DatePipe
  ],
  templateUrl: './dashboard-hotel.html',
  styleUrls: ['./dashboard-hotel.css']
})
export class DashboardHotel implements OnInit, AfterViewInit {
  // Propiedades necesarias para la plantilla
  currentUser: any = null;
  currentHotel: any = null;
  currentDate: Date = new Date();
  summaryCards: any[] = [];
  reservasRecientes: any[] = [];
  estadisticas: any = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.authService.isAdminHotel()) {
      if (this.authService.isSuperAdmin()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/perfil']);
      }
      return;
    }

    // Obtener el hotel asignado
    const hotelId = this.authService.getCurrentHotelId();
    if (hotelId) {
      this.currentHotel = { id: hotelId, nombre: 'Hotel Paradise' };
    } else {
      this.currentHotel = { id: 1, nombre: 'Hotel Paradise' };
    }

    // Inicializar datos de ejemplo para el dashboard del hotel
    this.initializeSummaryCards();
    this.initializeReservasRecientes();
    this.initializeEstadisticas();
  }

  initializeSummaryCards(): void {
    this.summaryCards = [
      { 
        title: 'Habitaciones del Hotel', 
        count: 25, 
        disponibles: 8, 
        icon: 'door-closed', 
        color: 'primary',
        route: ['/hoteles', this.currentHotel?.id, 'habitaciones']
      },
      { 
        title: 'Tipos de Habitación', 
        count: 4, 
        precioMin: 25000, 
        icon: 'grid-3x3-gap', 
        color: 'success',
        route: ['/hoteles', this.currentHotel?.id, 'tipos-habitaciones']
      },
      { 
        title: 'Reservas del Hotel', 
        count: 18, 
        change: 12, 
        icon: 'calendar-check', 
        color: 'info',
        route: ['/hoteles', this.currentHotel?.id, 'reservas']
      },
      { 
        title: 'Clientes del Hotel', 
        count: 45, 
        nuevosHoy: 3, 
        icon: 'people', 
        color: 'warning',
        route: ['/hoteles', this.currentHotel?.id, 'clientes']
      },
      { 
        title: 'Pagos del Hotel', 
        total: 1250000, 
        change: 8, 
        icon: 'credit-card', 
        color: 'danger',
        route: ['/hoteles', this.currentHotel?.id, 'pagos']
      },
      { 
        title: 'Fotos del Hotel', 
        count: 36, 
        galerias: 4, 
        icon: 'images', 
        color: 'purple',
        route: ['/hoteles', this.currentHotel?.id, 'fotos']
      }
    ];
  }

  initializeReservasRecientes(): void {
    this.reservasRecientes = [
      { habitacion: '101 - Suite Presidencial', cliente: 'Juan Pérez', checkIn: new Date(), checkOut: new Date(Date.now() + 86400000 * 3), estado: 'En curso' },
      { habitacion: '205 - Habitación Doble', cliente: 'María García', checkIn: new Date(Date.now() + 86400000), checkOut: new Date(Date.now() + 86400000 * 4), estado: 'Confirmada' },
      { habitacion: '102 - Suite Ejecutiva', cliente: 'Carlos Rodríguez', checkIn: new Date(Date.now() - 86400000), checkOut: new Date(Date.now() + 86400000 * 2), estado: 'En curso' },
      { habitacion: '308 - Habitación Individual', cliente: 'Ana López', checkIn: new Date(Date.now() + 86400000 * 2), checkOut: new Date(Date.now() + 86400000 * 5), estado: 'Pendiente' },
      { habitacion: '401 - Suite Familiar', cliente: 'Roberto Sánchez', checkIn: new Date(Date.now() + 86400000 * 3), checkOut: new Date(Date.now() + 86400000 * 7), estado: 'Confirmada' }
    ];
  }

  initializeEstadisticas(): void {
    this.estadisticas = {
      ocupacion: 72,
      ingresosHoy: 185000,
      reservasPendientes: 5,
      clientesNuevos: 15,
      pagosPendientes: 3,
      fotosSubidas: 8
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('welcomeModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        const modalAlreadyShown = sessionStorage.getItem('welcomeModalHotelShown');
        if (!modalAlreadyShown) {
          modal.show();
          sessionStorage.setItem('welcomeModalHotelShown', 'true');
        }
      }
    }, 500);
  }

  // Método para formatear valores en FCFA
  formatFcfa(value: number | string | undefined): string {
    if (value === undefined || value === null) {
      return '0 FCFA';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '0 FCFA';
    }
    
    const formattedValue = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
    
    return `${formattedValue} FCFA`;
  }

  getChangeBadgeClass(change: number): string {
    return change >= 0 ? 'bg-success' : 'bg-danger';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'arrow-up' : 'arrow-down';
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: {[key: string]: string} = {
      'Confirmada': 'bg-success',
      'En curso': 'bg-info',
      'Pendiente': 'bg-warning',
      'Cancelada': 'bg-danger',
      'Completada': 'bg-secondary'
    };
    return clases[estado] || 'bg-secondary';
  }

  // Métodos de navegación CORREGIDOS
  onAddClick(card: any): void {
    if (!card.route || !this.currentHotel?.id) {
      console.error('Ruta o ID del hotel no disponible');
      return;
    }
    
    // Construir la ruta específica para cada acción
    let route: any[] = [];
    let queryParams = {};
    
    switch(card.title) {
      case 'Habitaciones del Hotel':
        route = ['/hoteles', this.currentHotel.id, 'habitaciones', 'nueva'];
        break;
      case 'Tipos de Habitación':
        route = ['/hoteles', this.currentHotel.id, 'tipos-habitaciones', 'nuevo'];
        break;
      case 'Reservas del Hotel':
        route = ['/hoteles', this.currentHotel.id, 'reservas', 'nueva'];
        break;
      case 'Clientes del Hotel':
        route = ['/hoteles', this.currentHotel.id, 'clientes', 'registrar'];
        break;
      case 'Pagos del Hotel':
        route = ['/hoteles', this.currentHotel.id, 'pagos', 'registrar'];
        break;
      case 'Fotos del Hotel':
        route = ['/hoteles', this.currentHotel.id, 'fotos', 'subir'];
        break;
      default:
        route = card.route;
    }
    
    this.router.navigate(route, { queryParams });
  }

  onListClick(card: any): void {
    if (!card.route || !this.currentHotel?.id) {
      console.error('Ruta o ID del hotel no disponible');
      return;
    }
    
    // Usar la ruta definida en la tarjeta
    this.router.navigate(card.route);
  }

  cerrarSesion(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  verTodasReservas(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'reservas']);
    }
  }

  generarReporteDiario(): void {
    console.log('Generando reporte diario para el hotel');
  }

  crearReservaRapida(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'reservas', 'nueva-rapida']);
    }
  }

  registrarPago(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'pagos', 'registrar']);
    }
  }

  checkInRapido(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'reservas'], 
        { queryParams: { action: 'checkin' } });
    }
  }

  checkOutRapido(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'reservas'], 
        { queryParams: { action: 'checkout' } });
    }
  }

  subirFoto(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'fotos', 'subir']);
    }
  }

  generarReporte(): void {
    console.log('Generar reporte para el hotel');
  }

  // Métodos de navegación directa para el sidebar
  navegarAHabitaciones(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'habitaciones']);
    }
  }

  navegarATiposHabitacion(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'tipos-habitaciones']);
    }
  }

  navegarAReservas(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'reservas']);
    }
  }

  navegarAClientes(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'clientes']);
    }
  }

  navegarAPagos(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'pagos']);
    }
  }

  navegarAFotos(): void {
    if (this.currentHotel?.id) {
      this.router.navigate(['/hoteles', this.currentHotel.id, 'fotos']);
    }
  }

  // Getters para la plantilla
  get nombreUsuario(): string {
    return this.currentUser?.nombre || 'Administrador';
  }

  get nombreHotel(): string {
    return this.currentHotel?.nombre || 'Hotel Paradise';
  }
}