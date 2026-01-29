import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { ReservaService } from '../../servicios/reserva.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservas.html',
  styleUrls: ['./reservas.css']
})
export class ReservasComponent implements OnInit {
  reservas: any[] = [];
  cargando: boolean = true;
  error: string | null = null;
  isLoggedIn: boolean = false;
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Componente Reservas inicializado');
    this.verificarAutenticacion();
    this.cargarReservas();
  }

  verificarAutenticacion(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.usuario = this.authService.getUsuarioActual();
    
    if (!this.isLoggedIn) {
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    } else {
      console.log('Usuario autenticado:', this.usuario);
    }
  }

  // Método para ir a Nueva Reserva - ya vinculado en el template
  irANuevaReserva(): void {
    console.log('Navegando a nueva reserva...');
    if (this.isLoggedIn) {
      this.router.navigate(['/nueva-reserva']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Método para volver al inicio
  volverAInicio(): void {
    console.log('Volviendo al inicio...');
    this.router.navigate(['/inicio']);
  }

  // Método para cargar las reservas del usuario
  cargarReservas(): void {
    if (!this.isLoggedIn || !this.usuario) {
      this.error = 'Usuario no autenticado';
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.error = null;
    
    console.log('Cargando reservas para usuario ID:', this.usuario.id);
    
    // Si tienes un servicio de reservas, descomenta y usa esto:
    // this.reservaService.obtenerReservasPorUsuario(this.usuario.id).subscribe({
    //   next: (data) => {
    //     this.reservas = data;
    //     this.cargando = false;
    //     console.log('Reservas cargadas:', data);
    //   },
    //   error: (err) => {
    //     this.error = 'Error al cargar las reservas. Inténtalo de nuevo.';
    //     this.cargando = false;
    //     console.error('Error al cargar reservas:', err);
    //   }
    // });

    // Datos de ejemplo temporal - eliminar cuando implementes el servicio real
    setTimeout(() => {
      // Ejemplo con reservas vacías
      this.reservas = [];
      
      // Ejemplo con reservas de prueba (descomenta para ver cómo se verían las reservas)
      /*
      this.reservas = [
        {
          id: 1,
          estadoReserva: 'PENDIENTE',
          hotel: {
            nombre: 'Hotel Ureka',
            ubicacion: 'Malabo, Bioko Norte'
          },
          fechaEntrada: '2024-03-15',
          fechaSalida: '2024-03-20',
          numeroHuespedes: 2,
          habitacion: {
            tipo: 'Suite Deluxe'
          },
          pedidoEspecial: 'Cama king size, vista al mar',
          precioTotal: 250000,
          fechaReserva: '2024-02-10'
        },
        {
          id: 2,
          estadoReserva: 'CONFIRMADA',
          hotel: {
            nombre: 'Sofitel Malabo',
            ubicacion: 'Malabo, Guinea Ecuatorial'
          },
          fechaEntrada: '2024-04-01',
          fechaSalida: '2024-04-05',
          numeroHuespedes: 1,
          habitacion: {
            tipo: 'Habitación Ejecutiva'
          },
          pedidoEspecial: 'Desayuno incluido',
          precioTotal: 180000,
          fechaReserva: '2024-01-25'
        },
        {
          id: 3,
          estadoReserva: 'CANCELADA',
          hotel: {
            nombre: 'Hotel Bahía',
            ubicacion: 'Bata, Litoral'
          },
          fechaEntrada: '2024-02-10',
          fechaSalida: '2024-02-15',
          numeroHuespedes: 4,
          habitacion: {
            tipo: 'Suite Familiar'
          },
          pedidoEspecial: 'Dos camas adicionales',
          precioTotal: 320000,
          fechaReserva: '2024-01-15'
        }
      ];
      */
      
      this.cargando = false;
      console.log('Reservas cargadas (ejemplo):', this.reservas);
    }, 1500);
  }

  // Método para formatear fechas
  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  }

  // Método para formatear precios
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(precio || 0);
  }

  // Método para calcular noches
  calcularNoches(fechaEntrada: string, fechaSalida: string): number {
    if (!fechaEntrada || !fechaSalida) return 0;
    try {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferencia = salida.getTime() - entrada.getTime();
      return Math.ceil(diferencia / (1000 * 3600 * 24));
    } catch (error) {
      console.error('Error calculando noches:', error);
      return 0;
    }
  }

  // Método para obtener la clase CSS del estado
  getEstadoClass(estado: string): string {
    if (!estado) return 'badge bg-secondary';
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'CONFIRMADA':
        return 'badge bg-success';
      case 'PENDIENTE':
        return 'badge bg-warning text-dark';
      case 'CANCELADA':
        return 'badge bg-danger';
      case 'COMPLETADA':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }

  // Método para obtener el texto del estado
  getEstadoText(estado: string): string {
    if (!estado) return 'Desconocido';
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'CONFIRMADA': return 'Confirmada';
      case 'PENDIENTE': return 'Pendiente';
      case 'CANCELADA': return 'Cancelada';
      case 'COMPLETADA': return 'Completada';
      default: return estado;
    }
  }

  // Método para cancelar una reserva
  cancelarReserva(id: number): void {
    if (!id) {
      console.error('ID de reserva no válido');
      return;
    }

    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      console.log(`Cancelando reserva ${id}...`);
      
      // Lógica para cancelar la reserva
      // this.reservaService.cancelarReserva(id).subscribe({
      //   next: () => {
      //     alert('Reserva cancelada exitosamente');
      //     this.cargarReservas(); // Recargar la lista
      //   },
      //   error: (err) => {
      //     console.error('Error al cancelar reserva:', err);
      //     alert('Error al cancelar la reserva. Inténtalo de nuevo.');
      //   }
      // });
      
      // Simulación temporal
      const reserva = this.reservas.find(r => r.id === id);
      if (reserva) {
        reserva.estadoReserva = 'CANCELADA';
        alert('Reserva cancelada exitosamente (simulación)');
      }
    }
  }

  // Método para eliminar una reserva
  eliminarReserva(id: number): void {
    if (!id) {
      console.error('ID de reserva no válido');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar permanentemente esta reserva? Esta acción no se puede deshacer.')) {
      console.log(`Eliminando reserva ${id}...`);
      
      // Lógica para eliminar la reserva
      // this.reservaService.eliminarReserva(id).subscribe({
      //   next: () => {
      //     alert('Reserva eliminada exitosamente');
      //     this.cargarReservas(); // Recargar la lista
      //   },
      //   error: (err) => {
      //     console.error('Error al eliminar reserva:', err);
      //     alert('Error al eliminar la reserva. Inténtalo de nuevo.');
      //   }
      // });
      
      // Simulación temporal
      this.reservas = this.reservas.filter(r => r.id !== id);
      alert('Reserva eliminada exitosamente (simulación)');
    }
  }

  // Método para ver detalles de una reserva (si lo necesitas)
  verDetallesReserva(id: number): void {
    console.log(`Viendo detalles de reserva ${id}`);
    this.router.navigate(['/detalle-reserva', id]);
  }

  // Método para recargar las reservas
  recargarReservas(): void {
    console.log('Recargando reservas...');
    this.cargarReservas();
  }

  // Método para navegar a explorar hoteles
  explorarHoteles(): void {
    console.log('Navegando a hoteles...');
    this.router.navigate(['/hoteles']);
  }
}