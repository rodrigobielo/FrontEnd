import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { ReservaService } from '../../servicios/reserva.service';
import { HabitacionService } from '../../servicios/habitacion.service';

// Modelos
import { Reserva, ESTADOS_RESERVA } from '../../modelos/reserva.model';
import { Habitacion } from '../../modelos/habitacion.model';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './reservas.html',
  styleUrls: ['./reservas.css']
})
export class ReservasComponent implements OnInit, OnDestroy, AfterViewInit {
  // Inyección de servicios
  private reservaService = inject(ReservaService);
  private habitacionService = inject(HabitacionService);
  private fb = inject(FormBuilder);
  
  // Hacer que ESTADOS_RESERVA esté disponible en la plantilla
  ESTADOS_RESERVA = ESTADOS_RESERVA;
  
  // Formulario para cambiar estado
  estadoForm: FormGroup;
  
  // Variables de estado
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoHabitaciones: boolean = false;
  filtroTexto: string = '';
  filtroEstado: string = '';
  
  // Mensajes tipo toast
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Datos
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  reservaDetalles: Reserva | null = null;
  reservaAEliminar: Reserva | null = null;
  reservaCambiarEstado: Reserva | null = null;
  reservaConfirmar: Reserva | null = null;
  
  // Habitaciones disponibles
  habitacionesDisponibles: Habitacion[] = [];
  habitacionSeleccionada: number | null = null;
  habitacionSeleccionadaObj: Habitacion | null = null;
  
  // Estadísticas
  totalReservas: number = 0;
  reservasHoy: number = 0;
  ingresosTotales: number = 0;
  ocupacionPromedio: number = 0;
  
  // Estados disponibles
  estados = [
    { valor: ESTADOS_RESERVA.PENDIENTE, label: 'Pendiente', clase: 'warning', icon: 'bi-clock' },
    { valor: ESTADOS_RESERVA.CONFIRMADA, label: 'Confirmada', clase: 'info', icon: 'bi-check-circle' },
    { valor: ESTADOS_RESERVA.PAGADA, label: 'Pagada', clase: 'success', icon: 'bi-credit-card' },
    { valor: ESTADOS_RESERVA.CANCELADA, label: 'Cancelada', clase: 'danger', icon: 'bi-x-circle' },
    { valor: ESTADOS_RESERVA.RECHAZADA, label: 'Rechazada', clase: 'danger', icon: 'bi-x-octagon' }
  ];

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;
  private estadoModalInstance: any;
  private habitacionModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;
  @ViewChild('estadoModal') estadoModalRef!: ElementRef;
  @ViewChild('habitacionModal') habitacionModalRef!: ElementRef;

  constructor() {
    // Formulario para cambio de estado
    this.estadoForm = this.fb.group({
      nuevoEstado: ['', [Validators.required]],
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      motivoRechazo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarReservas();
  }

  ngAfterViewInit(): void {
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
    this.limpiarTemporizadores();
  }

  private initModales(): void {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      if (this.detallesModalRef?.nativeElement) {
        this.detallesModalInstance = new (window as any).bootstrap.Modal(this.detallesModalRef.nativeElement);
      }
      if (this.confirmarModalRef?.nativeElement) {
        this.confirmarModalInstance = new (window as any).bootstrap.Modal(this.confirmarModalRef.nativeElement);
      }
      if (this.estadoModalRef?.nativeElement) {
        this.estadoModalInstance = new (window as any).bootstrap.Modal(this.estadoModalRef.nativeElement);
      }
      if (this.habitacionModalRef?.nativeElement) {
        this.habitacionModalInstance = new (window as any).bootstrap.Modal(this.habitacionModalRef.nativeElement);
      }
    }
  }

  private destroyModales(): void {
    if (this.detallesModalInstance) {
      this.detallesModalInstance.dispose();
    }
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.dispose();
    }
    if (this.estadoModalInstance) {
      this.estadoModalInstance.dispose();
    }
    if (this.habitacionModalInstance) {
      this.habitacionModalInstance.dispose();
    }
  }

  private limpiarTemporizadores(): void {
    // Los temporizadores se manejan en los métodos de mensajes
  }

  private mostrarExito(mensaje: string): void {
    this.mostrarMensajeExito = true;
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensajeExito = '';
    }, 4000);
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mostrarMensajeError = false;
      this.mensajeError = '';
    }, 5000);
  }

  private mostrarInfo(mensaje: string): void {
    this.mostrarMensajeInfo = true;
    this.mensajeInfo = mensaje;
    setTimeout(() => {
      this.mostrarMensajeInfo = false;
      this.mensajeInfo = '';
    }, 3000);
  }

  // Cargar reservas
  cargarReservas(): void {
    this.cargando = true;
    this.reservaService.getReservas().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas || [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.totalReservas = this.reservas.length;
        this.cargando = false;
        
        if (reservas.length === 0) {
          this.mostrarInfo('No se encontraron reservas registradas');
        }
      },
      error: (error: any) => {
        console.error('Error cargando reservas:', error);
        this.mostrarError('No se pudieron cargar las reservas');
        this.cargando = false;
        this.reservas = [];
        this.reservasFiltradas = [];
      }
    });
  }

  // Calcular estadísticas
  calcularEstadisticas(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.reservasHoy = this.reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fechaReserva);
      fechaReserva.setHours(0, 0, 0, 0);
      return fechaReserva.getTime() === hoy.getTime();
    }).length;

    this.ingresosTotales = this.reservas
      .filter(reserva => reserva.estadoReserva === ESTADOS_RESERVA.PAGADA)
      .reduce((total, reserva) => total + reserva.precioTotal, 0);

    if (this.reservas.length > 0) {
      const totalHuespedes = this.reservas.reduce((total, reserva) => 
        total + reserva.numeroHuespedes, 0
      );
      this.ocupacionPromedio = totalHuespedes / this.reservas.length;
    }
  }

  // Filtrar reservas por texto
  filtrarReservas(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  // Filtrar por estado
  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.reservas];
    
    // Filtrar por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(r => r.estadoReserva === this.filtroEstado);
    }
    
    // Filtrar por texto
    if (this.filtroTexto) {
      resultado = resultado.filter(reserva =>
        reserva.codigo.toLowerCase().includes(this.filtroTexto) ||
        reserva.usuario?.nombre?.toLowerCase().includes(this.filtroTexto) ||
        reserva.usuario?.email?.toLowerCase().includes(this.filtroTexto) ||
        reserva.habitacion?.hotel?.nombre?.toLowerCase().includes(this.filtroTexto) ||
        reserva.habitacion?.numero?.toLowerCase().includes(this.filtroTexto) ||
        reserva.estadoReserva.toLowerCase().includes(this.filtroTexto)
      );
      
      if (this.filtroTexto && resultado.length === 0 && this.reservas.length > 0) {
        this.mostrarInfo(`No se encontraron reservas con "${this.filtroTexto}"`);
      }
    }
    
    this.reservasFiltradas = resultado;
  }

  // Obtener reservas filtradas por estado (para el tablero Kanban)
  getReservasPorEstado(estado: string): Reserva[] {
    return this.reservasFiltradas.filter(reserva => reserva.estadoReserva === estado);
  }

  // Método para rechazar rápidamente una reserva
  rechazarReserva(reserva: Reserva): void {
    this.reservaCambiarEstado = reserva;
    this.estadoForm.reset({
      nuevoEstado: ESTADOS_RESERVA.RECHAZADA,
      codigo: reserva.codigo,
      motivoRechazo: ''
    });
    if (this.estadoModalInstance) {
      this.estadoModalInstance.show();
    }
  }

  // Método para editar reserva
  editarReserva(reserva: Reserva): void {
    // Aquí puedes implementar la lógica de edición
    // Por ejemplo, redirigir a una página de edición
    // this.router.navigate(['/reservas/editar', reserva.id]);
    this.mostrarInfo('Funcionalidad de edición en desarrollo');
  }

  // Método para limpiar la búsqueda
  limpiarBusqueda(): void {
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  // Cambiar estado de reserva
  cambiarEstadoReserva(reserva: Reserva): void {
    this.reservaCambiarEstado = reserva;
    
    // Configurar el formulario con valores iniciales
    this.estadoForm.reset({
      nuevoEstado: reserva.estadoReserva,
      codigo: reserva.codigo,
      motivoRechazo: ''
    });
    
    // Mostrar el modal
    if (this.estadoModalInstance) {
      this.estadoModalInstance.show();
    }
  }

  // Verificar si se requiere motivo de rechazo
  requiereMotivoRechazo(): boolean {
    const nuevoEstado = this.estadoForm.get('nuevoEstado')?.value;
    return nuevoEstado === ESTADOS_RESERVA.RECHAZADA || nuevoEstado === ESTADOS_RESERVA.CANCELADA;
  }

  // Guardar cambio de estado
  guardarCambioEstado(): void {
    // Marcar todos los controles como tocados para mostrar errores
    Object.keys(this.estadoForm.controls).forEach(key => {
      const control = this.estadoForm.get(key);
      if (key !== 'motivoRechazo') {
        control?.markAsTouched();
      }
    });

    if (this.estadoForm.invalid) {
      this.mostrarError('Completa todos los campos requeridos correctamente.');
      return;
    }

    if (!this.reservaCambiarEstado || !this.reservaCambiarEstado.id) {
      return;
    }

    const nuevoEstado = this.estadoForm.get('nuevoEstado')?.value;
    const nuevoCodigo = this.estadoForm.get('codigo')?.value;
    const motivoRechazo = this.requiereMotivoRechazo() ? 
      this.estadoForm.get('motivoRechazo')?.value || 'Sin motivo especificado' : 
      undefined;

    // Si el estado es CONFIRMADA, abrir modal para seleccionar habitación
    if (nuevoEstado === ESTADOS_RESERVA.CONFIRMADA) {
      this.reservaConfirmar = this.reservaCambiarEstado;
      this.cargarHabitacionesDisponibles();
    } else {
      // Para otros estados, proceder normalmente
      this.actualizarEstadoReserva(nuevoEstado, nuevoCodigo, motivoRechazo);
    }
  }

  // Cargar habitaciones disponibles para confirmación
  cargarHabitacionesDisponibles(): void {
    if (!this.reservaConfirmar || !this.reservaConfirmar.habitacion?.hotel?.id) {
      this.mostrarError('No se puede determinar el hotel de la reserva.');
      return;
    }

    this.cargandoHabitaciones = true;
    const hotelId = this.reservaConfirmar.habitacion.hotel.id;
    const tipoHabitacion = this.reservaConfirmar.habitacion.tipo || '';

    this.habitacionService.getHabitacionesDisponiblesPorHotelYTipo(hotelId, tipoHabitacion).subscribe({
      next: (habitaciones: Habitacion[]) => {
        this.habitacionesDisponibles = habitaciones;
        this.habitacionSeleccionada = habitaciones.length > 0 ? habitaciones[0].id || null : null;
        this.onHabitacionSeleccionadaChange();
        this.cargandoHabitaciones = false;
        
        if (habitaciones.length === 0) {
          this.mostrarError('No hay habitaciones disponibles para este tipo en el hotel seleccionado.');
        } else {
          // Cerrar modal de estado y abrir modal de habitación
          if (this.estadoModalInstance) {
            this.estadoModalInstance.hide();
          }
          if (this.habitacionModalInstance) {
            this.habitacionModalInstance.show();
          }
        }
      },
      error: (error: any) => {
        console.error('Error cargando habitaciones:', error);
        this.cargandoHabitaciones = false;
        this.mostrarError('No se pudieron cargar las habitaciones disponibles.');
      }
    });
  }

  // Método para actualizar el objeto de habitación seleccionada
  onHabitacionSeleccionadaChange(): void {
    if (this.habitacionSeleccionada) {
      this.habitacionSeleccionadaObj = this.habitacionesDisponibles.find(
        h => h.id === this.habitacionSeleccionada
      ) || null;
    } else {
      this.habitacionSeleccionadaObj = null;
    }
  }

  // Confirmar reserva con habitación seleccionada
  confirmarConHabitacion(): void {
    if (!this.reservaConfirmar || !this.reservaConfirmar.id || !this.habitacionSeleccionada) {
      this.mostrarError('Datos incompletos para confirmar la reserva.');
      return;
    }

    const nuevoCodigo = this.estadoForm.get('codigo')?.value;

    this.guardando = true;
    this.reservaService.asignarHabitacionAReserva(
      this.reservaConfirmar.id,
      this.habitacionSeleccionada,
      nuevoCodigo
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarExito('La reserva ha sido confirmada y se ha asignado la habitación.');
        this.cargarReservas();
        
        // Cerrar modales
        if (this.habitacionModalInstance) {
          this.habitacionModalInstance.hide();
        }
        this.reservaConfirmar = null;
        this.habitacionesDisponibles = [];
        this.habitacionSeleccionada = null;
        this.habitacionSeleccionadaObj = null;
      },
      error: (error: any) => {
        console.error('Error confirmando reserva:', error);
        this.guardando = false;
        this.mostrarError('No se pudo confirmar la reserva. Intenta nuevamente.');
      }
    });
  }

  // Actualizar estado de reserva (para estados que no son CONFIRMADA)
  private actualizarEstadoReserva(estado: string, codigo: string, motivoRechazo?: string): void {
    if (!this.reservaCambiarEstado || !this.reservaCambiarEstado.id) {
      return;
    }

    this.guardando = true;
    this.reservaService.updateEstadoReserva(this.reservaCambiarEstado.id!, estado, codigo).subscribe({
      next: () => {
        this.cargarReservas();
        this.guardando = false;
        this.mostrarExito(`El estado de la reserva ha sido actualizado a ${this.getLabelEstado(estado)}.`);
        
        if (this.estadoModalInstance) {
          this.estadoModalInstance.hide();
        }
      },
      error: (error: any) => {
        console.error('Error actualizando estado:', error);
        this.guardando = false;
        this.mostrarError('No se pudo actualizar el estado. Intenta nuevamente.');
      }
    });
  }

  // Ver detalles de reserva
  verDetalles(reserva: Reserva): void {
    this.reservaDetalles = reserva;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Preparar eliminación de reserva
  eliminarReserva(reserva: Reserva): void {
    this.reservaAEliminar = reserva;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.reservaAEliminar || this.reservaAEliminar.id === undefined) {
      this.mostrarError('No se puede eliminar la reserva porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    this.reservaService.deleteReserva(this.reservaAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarExito('La reserva ha sido eliminada correctamente.');
        this.cargarReservas();
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.reservaAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando reserva:', error);
        this.guardando = false;
        this.mostrarError('No se pudo eliminar la reserva. Intenta nuevamente.');
      }
    });
  }

  // Obtener clase CSS para el estado
  getClaseEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? `bg-${estadoObj.clase}-subtle text-${estadoObj.clase}-emphasis` : 'bg-secondary-subtle text-secondary-emphasis';
  }

  // Obtener icono para el estado
  getIconoEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? estadoObj.icon : 'bi-question-circle';
  }

  // Obtener label para el estado
  getLabelEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? estadoObj.label : estado;
  }

  // Calcular número de noches
  calcularNoches(fechaEntrada: Date, fechaSalida: Date): number {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diff = salida.getTime() - entrada.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Copiar código al portapapeles
  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      this.mostrarExito('El código se ha copiado al portapapeles.');
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.mostrarError('No se pudo copiar el código.');
    });
  }
}