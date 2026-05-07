import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { ImagenesComponent } from '../imagenes.component/imagenes.component';
import { Habitaciones } from '../habitaciones/habitaciones';
import { tiposHabitaciones } from '../tipos-habitaciones/tipos-habitaciones';
import { ReservasComponent } from '../reservas/reservas';
import { ClientesComponent } from '../clientes/clientes';

@Component({
  selector: 'app-dashboard-hotel',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    DatePipe,
    ImagenesComponent,
    Habitaciones,
    tiposHabitaciones,
    ReservasComponent,
    ClientesComponent
  ],
  templateUrl: './dashboard-hotel.html',
  styleUrls: ['./dashboard-hotel.css']
})
export class DashboardHotel implements OnInit, AfterViewInit {
  currentUser: any = null;
  currentHotel: any = null;
  currentDate: Date = new Date();
  summaryCards: any[] = [];
  reservasRecientes: any[] = [];
  estadisticas: any = {};
  isLoading: boolean = true;
  hotelCargado: boolean = false;
  seccionActiva: string = 'dashboard';

  // Referencias a componentes hijos
  @ViewChild(ClientesComponent) clientesComponent!: ClientesComponent;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

    this.cargarHotelAsignado();
  }

  ngAfterViewInit(): void {
    const checkHotelInterval = setInterval(() => {
      if (this.hotelCargado && this.currentHotel?.nombre !== 'Hotel sin especificar') {
        clearInterval(checkHotelInterval);
        setTimeout(() => {
          const modalElement = document.getElementById('welcomeModal');
          if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            const modalAlreadyShown = sessionStorage.getItem('welcomeModalHotelShown');
            if (!modalAlreadyShown && this.currentHotel?.nombre) {
              modal.show();
              sessionStorage.setItem('welcomeModalHotelShown', 'true');
            }
          }
        }, 500);
      }
    }, 100);
  }

  private cargarHotelAsignado(): void {
    this.isLoading = true;
    
    let hotel = this.authService.getCurrentHotel();
    
    if (hotel && hotel.id) {
      this.currentHotel = hotel;
      this.hotelCargado = true;
      this.isLoading = false;
      this.initializeDashboardData();
      this.cdr.detectChanges();
    } else {
      const hotelId = this.authService.getCurrentHotelId();
      
      if (hotelId) {
        this.authService.recargarHotel().subscribe({
          next: (hotelData) => {
            console.log('Hotel cargado del backend:', hotelData);
            
            if (hotelData && hotelData.id) {
              this.authService.actualizarHotel(hotelData);
              this.currentHotel = hotelData;
            } else {
              this.currentHotel = {
                id: hotelId,
                nombre: hotelData.nombre || hotelData.hotel_nombre || 'Hotel sin especificar',
                direccion: hotelData.direccion || '',
                telefono: hotelData.telefono || '',
                email: hotelData.email || ''
              };
              this.authService.actualizarHotel(this.currentHotel);
            }
            
            this.hotelCargado = true;
            this.isLoading = false;
            this.initializeDashboardData();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al cargar hotel:', error);
            this.currentHotel = { 
              id: this.authService.getCurrentHotelId() || 0, 
              nombre: 'Hotel sin especificar' 
            };
            this.hotelCargado = true;
            this.isLoading = false;
            this.initializeDashboardData();
            this.cdr.detectChanges();
          }
        });
      } else {
        console.warn('No se encontró hotelId para el usuario');
        this.currentHotel = { id: 0, nombre: 'Hotel sin especificar' };
        this.hotelCargado = true;
        this.isLoading = false;
        this.initializeDashboardData();
        this.cdr.detectChanges();
      }
    }
  }

  private initializeDashboardData(): void {
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
        seccion: 'habitaciones'
      },
      { 
        title: 'Tipos de Habitación', 
        count: 4, 
        precioMin: 25000, 
        icon: 'grid-3x3-gap', 
        color: 'success',
        seccion: 'tipos-habitacion'
      },
      { 
        title: 'Reservas del Hotel', 
        count: 18, 
        change: 12, 
        icon: 'calendar-check', 
        color: 'info',
        seccion: 'reservas'
      },
      { 
        title: 'Clientes del Hotel', 
        count: 45, 
        nuevosHoy: 3, 
        icon: 'people', 
        color: 'warning',
        seccion: 'clientes'
      },
      { 
        title: 'Pagos del Hotel', 
        total: 1250000, 
        change: 8, 
        icon: 'credit-card', 
        color: 'danger',
        seccion: 'pagos'
      },
      { 
        title: 'Fotos del Hotel', 
        count: 36, 
        galerias: 4, 
        icon: 'images', 
        color: 'purple',
        seccion: 'fotos'
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

  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    console.log(`Navegando a sección: ${seccion}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  // Métodos de actualización para las diferentes secciones
  actualizarGaleria(): void {
    console.log('Actualizando galería de fotos');
  }

  actualizarHabitaciones(): void {
    console.log('Actualizando lista de habitaciones');
  }

  actualizarTiposHabitaciones(): void {
    console.log('Actualizando tipos de habitaciones');
  }

  actualizarReservas(): void {
    console.log('Actualizando lista de reservas');
  }

  actualizarClientes(): void {
    console.log('Actualizando lista de clientes');
    // Si el componente Clientes está visible, refrescar sus datos
    if (this.clientesComponent && this.seccionActiva === 'clientes') {
      this.clientesComponent.refrescar();
    }
  }

  onMoreInfoClick(card: any): void {
    if (card.seccion) {
      this.mostrarSeccion(card.seccion);
    } else if (card.route && this.currentHotel?.id) {
      this.router.navigate(card.route);
    } else {
      console.error('Ruta o sección no disponible');
    }
  }

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
      this.authService.logout();
    }
  }

  get nombreUsuario(): string {
    return this.currentUser?.nombre || this.currentUser?.usuario_nombre || 'Administrador';
  }

  get nombreHotel(): string {
    if (this.isLoading) {
      return 'Cargando...';
    }
    return this.currentHotel?.nombre || 'Hotel sin especificar';
  }

  // Métodos de navegación
  navegarAHabitaciones(): void {
    this.mostrarSeccion('habitaciones');
  }

  navegarATiposHabitacion(): void {
    this.mostrarSeccion('tipos-habitacion');
  }

  navegarAReservas(): void {
    this.mostrarSeccion('reservas');
  }

  navegarAClientes(): void {
    this.mostrarSeccion('clientes');
  }

  navegarAPagos(): void {
    this.mostrarSeccion('pagos');
  }

  navegarAFotos(): void {
    this.mostrarSeccion('fotos');
  }

  // Métodos de acciones rápidas
  verTodasReservas(): void {
    this.mostrarSeccion('reservas');
  }

  generarReporteDiario(): void {
    console.log('Generando reporte diario para el hotel:', this.nombreHotel);
  }

  crearReservaRapida(): void {
    this.mostrarSeccion('reservas');
  }

  registrarPago(): void {
    this.mostrarSeccion('pagos');
  }

  checkInRapido(): void {
    this.mostrarSeccion('reservas');
  }

  checkOutRapido(): void {
    this.mostrarSeccion('reservas');
  }

  subirFoto(): void {
    this.mostrarSeccion('fotos');
  }

  generarReporte(): void {
    console.log('Generar reporte para el hotel');
    this.mostrarSeccion('reportes');
  }
}