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
  
  // Clasificaciones
  reservasRecientes: Reserva[] = [];
  reservasConfirmadas: Reserva[] = [];
  reservasPagadas: Reserva[] = [];
  reservasRechazadas: Reserva[] = [];
  
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
    this.calcularEstadisticas();
  }

  ngAfterViewInit(): void {
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
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

  // Cargar reservas
  cargarReservas(): void {
    this.cargando = true;
    this.reservaService.getReservas().subscribe({
      next: (reservas: Reserva[]) => {
        this.reservas = reservas || [];
        this.clasificarReservas();
        this.aplicarFiltros();
        this.totalReservas = this.reservas.length;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando reservas:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las reservas');
        this.cargando = false;
        this.reservas = [];
        this.reservasFiltradas = [];
      }
    });
  }

  // Clasificar reservas en categorías
  clasificarReservas(): void {
    const hoy = new Date();
    const sieteDiasAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.reservasRecientes = this.reservas.filter(reserva => {
      const fechaReserva = new Date(reserva.fechaReserva);
      return fechaReserva >= sieteDiasAtras;
    });

    this.reservasConfirmadas = this.reservas.filter(reserva => 
      reserva.estadoReserva === ESTADOS_RESERVA.CONFIRMADA
    );

    this.reservasPagadas = this.reservas.filter(reserva => 
      reserva.estadoReserva === ESTADOS_RESERVA.PAGADA
    );

    this.reservasRechazadas = this.reservas.filter(reserva => 
      reserva.estadoReserva === ESTADOS_RESERVA.RECHAZADA
    );
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
    }
    
    this.reservasFiltradas = resultado;
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
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
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
      this.mostrarNotificacion('error', 'Error', 'No se puede determinar el hotel de la reserva.');
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
          this.mostrarNotificacion('warning', 
            'No hay habitaciones disponibles', 
            'No hay habitaciones disponibles para este tipo en el hotel seleccionado.'
          );
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
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudieron cargar las habitaciones disponibles.'
        );
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
      this.mostrarNotificacion('error', 'Error', 'Datos incompletos para confirmar la reserva.');
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
        this.mostrarNotificacion('success', 
          'Reserva confirmada',
          `La reserva ha sido confirmada y se ha asignado la habitación.`
        );
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
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo confirmar la reserva. Intenta nuevamente.'
        );
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
        this.mostrarNotificacion('success', 
          'Estado actualizado',
          `El estado de la reserva ha sido actualizado a ${this.getLabelEstado(estado)}.`
        );
        
        if (this.estadoModalInstance) {
          this.estadoModalInstance.hide();
        }
      },
      error: (error: any) => {
        console.error('Error actualizando estado:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo actualizar el estado. Intenta nuevamente.'
        );
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
      this.mostrarNotificacion('error', 'Error', 'No se puede eliminar la reserva porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    this.reservaService.deleteReserva(this.reservaAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Reserva eliminada', 
          `La reserva ha sido eliminada correctamente.`
        );
        this.cargarReservas();
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.reservaAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando reserva:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo eliminar la reserva. Intenta nuevamente.'
        );
      }
    });
  }

  // Obtener clase CSS para el estado
  getClaseEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? `text-bg-${estadoObj.clase}-subtle text-${estadoObj.clase}-emphasis` : 'text-bg-secondary';
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

  // Mostrar notificación
  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    const toastId = 'notification-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-bg-${tipo === 'error' ? 'danger' : tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const iconos = {
      success: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      error: 'bi-x-circle-fill'
    };
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${iconos[tipo]} me-2"></i>
          <strong>${titulo}</strong><br>
          <small>${mensaje}</small>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    const container = document.querySelector('.toast-container') || (() => {
      const newContainer = document.createElement('div');
      newContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      newContainer.style.zIndex = '1055';
      document.body.appendChild(newContainer);
      return newContainer;
    })();
    
    container.appendChild(toast);
    const bsToast = new (window as any).bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
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
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Copiar código al portapapeles
  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      this.mostrarNotificacion('success', 'Código copiado', 'El código se ha copiado al portapapeles.');
    }).catch(err => {
      console.error('Error al copiar:', err);
      this.mostrarNotificacion('error', 'Error', 'No se pudo copiar el código.');
    });
  }
}