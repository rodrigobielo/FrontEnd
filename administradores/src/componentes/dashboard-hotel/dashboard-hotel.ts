import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, NgFor, NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-hotel',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgFor,
    NgClass
  ],
  templateUrl: './dashboard-hotel.html',
  styleUrls: ['./dashboard-hotel.css']
})
export class DashboardHotelComponent implements OnInit, AfterViewInit {
  @ViewChild('ocupacionCanvas') ocupacionCanvas!: ElementRef;
  
  summaryCards = [
    { 
      title: 'Habitaciones', 
      count: 48, 
      disponibles: 12,
      icon: 'door-closed', 
      color: 'primary' 
    },
    { 
      title: 'Tipos de Habitaciones', 
      count: 6, 
      precioMin: 120,
      icon: 'grid-3x3-gap', 
      color: 'success' 
    },
    { 
      title: 'Reservas', 
      count: 8, 
      change: 14, 
      icon: 'calendar-check', 
      color: 'info' 
    },
    { 
      title: 'Clientes', 
      count: 245, 
      nuevosHoy: 3,
      icon: 'people', 
      color: 'warning' 
    },
    { 
      title: 'Pagos', 
      total: 4560, 
      change: 8, 
      icon: 'credit-card', 
      color: 'danger' 
    },
    { 
      title: 'Fotos del Hotel', 
      count: 156, 
      galerias: 8,
      icon: 'images', 
      color: 'purple' 
    }
  ];

  reservasRecientes = [
    { habitacion: '101 - Suite', cliente: 'Juan Pérez', checkIn: new Date(), checkOut: new Date(Date.now() + 86400000*2), estado: 'Confirmada' },
    { habitacion: '205 - Doble', cliente: 'María García', checkIn: new Date(), checkOut: new Date(Date.now() + 86400000*3), estado: 'En curso' },
    { habitacion: '312 - Individual', cliente: 'Carlos López', checkIn: new Date(Date.now() - 86400000), checkOut: new Date(Date.now() + 86400000), estado: 'En curso' },
    { habitacion: '108 - Suite', cliente: 'Ana Martínez', checkIn: new Date(Date.now() + 86400000*2), checkOut: new Date(Date.now() + 86400000*5), estado: 'Pendiente' },
    { habitacion: '404 - Familiar', cliente: 'Pedro Sánchez', checkIn: new Date(), checkOut: new Date(Date.now() + 86400000*4), estado: 'Confirmada' }
  ];

  estadisticas = {
    ocupacion: 75,
    ingresosHoy: 4560,
    reservasPendientes: 5,
    clientesNuevos: 15,
    pagosPendientes: 3,
    fotosSubidas: 12
  };

  currentUser: any = { name: 'Admin Hotel' };
  currentDate: Date = new Date();
  periodoGrafico: string = 'hoy';
  loading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  private cargarDatosDashboard(): void {
    this.loading = true;
    // Simular carga de datos
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showWelcomeModal();
    }, 500);
  }

  private showWelcomeModal(): void {
    const modalAlreadyShown = sessionStorage.getItem('welcomeModalHotelShown');
    
    if (modalAlreadyShown === 'true') {
      return;
    }
    
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      
      sessionStorage.setItem('welcomeModalHotelShown', 'true');
      modal.show();
    }
  }

  onAddClick(cardType: string): void {
    console.log(`Añadir nuevo ${cardType}`);
    
    const rutas: {[key: string]: string} = {
      'Habitaciones': '/habitaciones/nueva',
      'Tipos de Habitaciones': '/tipos-habitaciones/nuevo',
      'Reservas': '/reservas/nueva',
      'Clientes': '/clientes/nuevo',
      'Pagos': '/pagos/nuevo',
      'Fotos': '/fotos/subir'
    };
    
    if (rutas[cardType]) {
      this.router.navigate([rutas[cardType]]);
    }
  }

  onListClick(cardType: string): void {
    console.log(`Ver lista de ${cardType}`);
    
    const rutas: {[key: string]: string} = {
      'Habitaciones': '/habitaciones',
      'Tipos de Habitaciones': '/tipos-habitaciones',
      'Reservas': '/reservas',
      'Clientes': '/clientes',
      'Pagos': '/pagos',
      'Fotos': '/fotos'
    };
    
    if (rutas[cardType]) {
      this.router.navigate([rutas[cardType]]);
    }
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

  cerrarSesion(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      console.log('Sesión cerrada');
      sessionStorage.removeItem('welcomeModalHotelShown');
      this.router.navigate(['/login']);
    }
  }

  verTodasReservas(): void {
    this.router.navigate(['/reservas']);
  }

  generarReporteDiario(): void {
    console.log('Generando reporte diario...');
    alert('Reporte diario generado correctamente');
  }

  crearReservaRapida(): void {
    this.router.navigate(['/reservas/nueva']);
  }

  registrarPago(): void {
    this.router.navigate(['/pagos/nuevo']);
  }

  checkInRapido(): void {
    console.log('Check-in rápido');
  }

  checkOutRapido(): void {
    console.log('Check-out rápido');
  }

  subirFoto(): void {
    this.router.navigate(['/fotos/subir']);
  }

  generarReporte(): void {
    console.log('Generando reporte...');
  }

  actualizarGrafico(): void {
    console.log('Actualizando gráfico para periodo:', this.periodoGrafico);
  }
}