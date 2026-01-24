import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
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
    DatePipe,
    CurrencyPipe
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

    // Inicializar datos de ejemplo para el dashboard del hotel
    this.summaryCards = [
      { title: 'Mis Habitaciones', count: 0, disponibles: 0, icon: 'door-closed', color: 'primary' },
      { title: 'Tipos de Habitaciones', count: 0, precioMin: 0, icon: 'grid-3x3-gap', color: 'success' },
      { title: 'Mis Reservas', count: 0, change: 0, icon: 'calendar-check', color: 'info' },
      { title: 'Mis Clientes', count: 0, nuevosHoy: 0, icon: 'people', color: 'warning' },
      { title: 'Mis Pagos', total: 0, change: 0, icon: 'credit-card', color: 'danger' },
      { title: 'Fotos Mi Hotel', count: 0, galerias: 0, icon: 'images', color: 'purple' }
    ];

    this.reservasRecientes = [];
    this.estadisticas = {
      ocupacion: 0,
      ingresosHoy: 0,
      reservasPendientes: 0,
      clientesNuevos: 0,
      pagosPendientes: 0,
      fotosSubidas: 0
    };

    // Obtener el hotel asignado
    const hotelId = this.authService.getCurrentHotelId();
    if (hotelId) {
      // Aquí iría la llamada para obtener los datos del hotel, pero por ahora usamos un objeto vacío
      this.currentHotel = { id: hotelId, nombre: 'Mi Hotel' };
    } else {
      this.currentHotel = { id: 1, nombre: 'Mi Hotel' };
    }
  }

  ngAfterViewInit(): void {
    // Mostrar modal de bienvenida si es necesario
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

  // Métodos necesarios para la plantilla
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

  onAddClick(cardType: string): void {
    console.log(`Añadir nuevo ${cardType} para el hotel ${this.currentHotel?.nombre}`);
  }

  onListClick(cardType: string): void {
    console.log(`Ver lista de ${cardType} para el hotel ${this.currentHotel?.nombre}`);
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
    console.log('Ver todas las reservas del hotel');
  }

  generarReporteDiario(): void {
    console.log('Generando reporte diario para el hotel');
  }

  crearReservaRapida(): void {
    console.log('Crear reserva rápida para el hotel');
  }

  registrarPago(): void {
    console.log('Registrar pago para el hotel');
  }

  checkInRapido(): void {
    console.log('Check-in rápido para el hotel');
  }

  checkOutRapido(): void {
    console.log('Check-out rápido para el hotel');
  }

  subirFoto(): void {
    console.log('Subir foto para el hotel');
  }

  generarReporte(): void {
    console.log('Generar reporte para el hotel');
  }

  // Getters para la plantilla
  get nombreUsuario(): string {
    return this.currentUser?.nombre || 'Administrador';
  }

  get nombreHotel(): string {
    return this.currentHotel?.nombre || 'Mi Hotel';
  }
}