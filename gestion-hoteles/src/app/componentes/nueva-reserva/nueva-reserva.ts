import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NuevaReservaService } from '../../servicios/nueva-reserva.service';
import { AuthService } from '../../servicios/auth.service';
import { ReservaRequest, Habitacion, Hotel } from '../../modelos/nueva-reserva.model';

@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reserva.html',
  styleUrls: ['./nueva-reserva.css']
})
export class NuevaReserva implements OnInit {
  nuevaReserva: ReservaRequest = {
    fechaEntrada: '',
    fechaSalida: '',
    numeroHuespedes: 1,
    pedidoEspecial: '',
    precioTotal: 0,
    estadoReserva: 'PENDIENTE',
    habitaciones: {
      id: 0
    },
    usuarios: {
      id: 0
    }
  };

  hoteles: Hotel[] = [];
  habitaciones: Habitacion[] = [];
  cargando: boolean = false;
  cargandoHoteles: boolean = true;
  error: string = '';
  mensajeExito: string = '';
  codigoReservaGenerado: string = '';
  usuario: any = null;
  hotelSeleccionadoId: number = 0;

  constructor(
    private router: Router,
    private nuevaReservaService: NuevaReservaService,
    private authService: AuthService
  ) {
    console.log('Componente NuevaReserva creado');
  }

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.setFechasPorDefecto();
    this.cargarHoteles();
    this.generarCodigo();
  }

  verificarAutenticacion(): void {
    this.usuario = this.authService.getUsuarioActual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
    } else {
      this.nuevaReserva.usuarios = { id: this.usuario.id };
    }
  }

  setFechasPorDefecto(): void {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    this.nuevaReserva.fechaEntrada = hoy.toISOString().split('T')[0];
    this.nuevaReserva.fechaSalida = manana.toISOString().split('T')[0];
  }

  generarCodigo(): void {
    this.codigoReservaGenerado = this.nuevaReservaService.generarCodigoReserva();
  }

  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.nuevaReservaService.getHoteles().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles.filter(hotel => hotel.activo);
        if (this.hoteles.length > 0) {
          this.hotelSeleccionadoId = this.hoteles[0].id;
          this.cargarHabitaciones(this.hoteles[0].id);
        }
        this.cargandoHoteles = false;
      },
      error: (error) => {
        this.error = 'Error al cargar hoteles: ' + error.message;
        this.cargandoHoteles = false;
        console.error('Error al cargar hoteles:', error);
      }
    });
  }

  cargarHabitaciones(hotelId: number): void {
    if (!hotelId) return;
    
    this.nuevaReservaService.getHabitacionesPorHotel(hotelId).subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones.filter(hab => hab.disponible);
        if (this.habitaciones.length > 0) {
          this.nuevaReserva.habitaciones.id = this.habitaciones[0].id;
          this.calcularPrecioTotal();
        } else {
          this.nuevaReserva.habitaciones.id = 0;
          this.nuevaReserva.precioTotal = 0;
        }
      },
      error: (error) => {
        console.error('Error al cargar habitaciones:', error);
        this.habitaciones = [];
        this.nuevaReserva.habitaciones.id = 0;
        this.nuevaReserva.precioTotal = 0;
      }
    });
  }

  onHotelChange(event: any): void {
    const hotelId = Number(event.target.value);
    this.hotelSeleccionadoId = hotelId;
    if (hotelId) {
      this.cargarHabitaciones(hotelId);
    } else {
      this.habitaciones = [];
      this.nuevaReserva.habitaciones.id = 0;
      this.nuevaReserva.precioTotal = 0;
    }
  }

  onHabitacionChange(event: any): void {
    const habitacionId = Number(event.target.value);
    this.nuevaReserva.habitaciones.id = habitacionId;
    this.calcularPrecioTotal();
  }

  getHabitacionSeleccionada(): Habitacion | undefined {
    return this.habitaciones.find(h => h.id === this.nuevaReserva.habitaciones.id);
  }

  calcularNoches(): number {
    if (!this.nuevaReserva.fechaEntrada || !this.nuevaReserva.fechaSalida) return 0;
    
    const inicio = new Date(this.nuevaReserva.fechaEntrada);
    const fin = new Date(this.nuevaReserva.fechaSalida);
    
    if (fin <= inicio) return 0;
    
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  calcularPrecioTotal(): void {
    const noches = this.calcularNoches();
    const habitacion = this.getHabitacionSeleccionada();
    
    if (!habitacion || !habitacion.precioPorNoche || noches === 0) {
      this.nuevaReserva.precioTotal = 0;
      return;
    }
    
    this.nuevaReserva.precioTotal = noches * habitacion.precioPorNoche;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio) + ' FCFA';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  fechaMinimaSalida(): string {
    if (!this.nuevaReserva.fechaEntrada) return this.hoy();
    
    const fecha = new Date(this.nuevaReserva.fechaEntrada);
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().split('T')[0];
  }

  onSubmit(): void {
    // Validaciones
    if (!this.nuevaReserva.fechaEntrada || !this.nuevaReserva.fechaSalida) {
      this.error = 'Las fechas de entrada y salida son obligatorias';
      return;
    }

    if (this.nuevaReserva.fechaSalida <= this.nuevaReserva.fechaEntrada) {
      this.error = 'La fecha de salida debe ser posterior a la fecha de entrada';
      return;
    }

    if (this.nuevaReserva.numeroHuespedes < 1) {
      this.error = 'Debe haber al menos un huésped';
      return;
    }

    if (!this.nuevaReserva.habitaciones.id) {
      this.error = 'Debe seleccionar una habitación';
      return;
    }

    // Verificar capacidad de la habitación
    const habitacionSeleccionada = this.getHabitacionSeleccionada();
    if (habitacionSeleccionada && this.nuevaReserva.numeroHuespedes > habitacionSeleccionada.capacidad) {
      this.error = `La habitación seleccionada tiene capacidad máxima de ${habitacionSeleccionada.capacidad} huéspedes`;
      return;
    }

    if (this.nuevaReserva.precioTotal <= 0) {
      this.error = 'El precio total debe ser mayor a 0';
      return;
    }

    if (!this.usuario || !this.usuario.id) {
      this.error = 'Usuario no autenticado. Por favor, inicie sesión nuevamente.';
      return;
    }

    // Asegurar que el usuario está asignado
    this.nuevaReserva.usuarios = { id: this.usuario.id };

    this.cargando = true;
    this.error = '';
    this.mensajeExito = '';

    this.nuevaReservaService.crearReserva(this.nuevaReserva).subscribe({
      next: (reservaCreada) => {
        this.cargando = false;
        this.mensajeExito = `¡Reserva creada exitosamente! 
                            Código de reserva: ${reservaCreada.codigo || this.codigoReservaGenerado}
                            Total: ${this.formatearPrecio(reservaCreada.precioTotal)}`;
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/reservas']);
        }, 3000);
      },
      error: (error) => {
        this.cargando = false;
        this.error = 'Error al crear la reserva: ' + error.message;
        console.error('Error en crear reserva:', error);
      }
    });
  }

  volverAReservas(): void {
    this.router.navigate(['/reservas']);
  }
}