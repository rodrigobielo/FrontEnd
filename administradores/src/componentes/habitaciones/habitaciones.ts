import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { HabitacionService } from '../../servicios/habitacion.service';
import { HotelService } from '../../servicios/hotel.service';
import { TipoHabitacionService } from '../../servicios/tipo-habitacion.service';

// Modelos
import { Habitacion, HabitacionFormData } from '../../modelos/habitacion.model';
import { Hotel } from '../../modelos/hotel.model';
import { TipoHabitacion } from '../../modelos/tipo-habitacion.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './habitaciones.html',
  styleUrls: ['./habitaciones.css']
})
export class Habitaciones implements OnInit, OnDestroy, AfterViewInit {
  // Inyección de servicios
  private habitacionService = inject(HabitacionService);
  private hotelService = inject(HotelService);
  private tipoHabitacionService = inject(TipoHabitacionService);
  private fb = inject(FormBuilder);
  
  // Formulario
  habitacionForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoHoteles: boolean = false;
  cargandoTiposHabitacion: boolean = false;
  filtroHotel: number | null = null;
  filtroTexto: string = '';
  
  // Datos
  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  hoteles: Hotel[] = [];
  tiposHabitacion: TipoHabitacion[] = [];
  habitacionEditando: Habitacion | null = null;
  habitacionDetalles: Habitacion | null = null;
  habitacionAEliminar: Habitacion | null = null;
  
  // Estadísticas
  totalHabitaciones: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor() {
    // Formulario de habitación con valores por defecto
    this.habitacionForm = this.fb.group({
      precioNoche: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      disponibilidad: [true],
      caracteristicas: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      hotelId: ['', [Validators.required]],
      tipoHabitacionId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarHoteles();
    this.cargarTiposHabitacion();
    this.cargarHabitaciones();
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
    }
  }

  private destroyModales(): void {
    if (this.detallesModalInstance) {
      this.detallesModalInstance.dispose();
    }
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.dispose();
    }
  }

  // Cargar hoteles
  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.cargandoHoteles = false;
      },
      error: (error: any) => {
        console.error('Error cargando hoteles:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los hoteles');
        this.cargandoHoteles = false;
        this.hoteles = [];
      }
    });
  }

  // Cargar tipos de habitación
  cargarTiposHabitacion(): void {
    this.cargandoTiposHabitacion = true;
    this.tipoHabitacionService.getTiposHabitacion().subscribe({
      next: (tipos: TipoHabitacion[]) => {
        this.tiposHabitacion = tipos || [];
        this.cargandoTiposHabitacion = false;
      },
      error: (error: any) => {
        console.error('Error cargando tipos de habitación:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los tipos de habitación');
        this.cargandoTiposHabitacion = false;
        this.tiposHabitacion = [];
      }
    });
  }

  // Cargar habitaciones
  cargarHabitaciones(): void {
    this.cargando = true;
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones: Habitacion[]) => {
        this.habitaciones = habitaciones || [];
        this.habitacionesFiltradas = [...this.habitaciones];
        this.totalHabitaciones = this.habitaciones.length;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando habitaciones:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las habitaciones');
        this.cargando = false;
        this.habitaciones = [];
        this.habitacionesFiltradas = [];
      }
    });
  }

  // Filtrar habitaciones por texto
  filtrarHabitaciones(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  // Filtrar por hotel - ACEPTA number | undefined
  filtrarPorHotel(hotelId: number | undefined): void {
    this.filtroHotel = hotelId === undefined || hotelId === 0 ? null : hotelId;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.habitaciones];
    
    // Filtrar por hotel
    if (this.filtroHotel) {
      resultado = resultado.filter(h => h.hoteles?.id === this.filtroHotel);
    }
    
    // Filtrar por texto
    if (this.filtroTexto) {
      resultado = resultado.filter(habitacion => {
        const texto = this.filtroTexto;
        const caracteristicas = habitacion.caracteristicas.toLowerCase();
        const nombreHotel = habitacion.hoteles?.nombre?.toLowerCase() || '';
        const nombreCiudad = habitacion.hoteles?.ciudades?.nombre?.toLowerCase() || '';
        const nombreTipo = habitacion.tiposHabitaciones?.nombre?.toLowerCase() || '';

        return caracteristicas.includes(texto) ||
               nombreHotel.includes(texto) ||
               nombreCiudad.includes(texto) ||
               nombreTipo.includes(texto);
      });
    }
    
    this.habitacionesFiltradas = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.habitacionEditando = null;
    
    this.habitacionForm.reset({
      precioNoche: null,
      disponibilidad: true,
      caracteristicas: '',
      hotelId: '',
      tipoHabitacionId: ''
    });
    
    this.habitacionForm.markAsPristine();
    this.habitacionForm.markAsUntouched();
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.habitacionEditando = null;
    this.habitacionForm.reset();
    this.habitacionForm.markAsPristine();
    this.habitacionForm.markAsUntouched();
  }

  // Editar habitación
  editarHabitacion(habitacion: Habitacion): void {
    this.modoEdicion = true;
    this.habitacionEditando = habitacion;
    
    this.habitacionForm.patchValue({
      precioNoche: habitacion.precioNoche,
      disponibilidad: habitacion.disponibilidad,
      caracteristicas: habitacion.caracteristicas,
      hotelId: habitacion.hoteles?.id || '',
      tipoHabitacionId: habitacion.tiposHabitaciones?.id || ''
    });
  }

  // Guardar habitación
  guardarHabitacion(): void {
    // Marcar todos los controles como tocados para mostrar errores
    Object.keys(this.habitacionForm.controls).forEach(key => {
      const control = this.habitacionForm.get(key);
      control?.markAsTouched();
    });

    if (this.habitacionForm.invalid) {
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
      return;
    }

    // Verificar que haya hoteles y tipos disponibles
    if (this.hoteles.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay hoteles disponibles en la base de datos.'
      );
      return;
    }

    if (this.tiposHabitacion.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay tipos de habitación disponibles en la base de datos.'
      );
      return;
    }

    this.guardando = true;
    const habitacionData = this.habitacionForm.value;

    // Usar aserción no nula para id en modo edición
    if (this.modoEdicion && this.habitacionEditando && this.habitacionEditando.id !== undefined) {
      this.habitacionService.updateHabitacion(this.habitacionEditando.id!, habitacionData).subscribe({
        next: () => {
          this.cargarHabitaciones();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Habitación actualizada',
            `Habitación actualizada correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error actualizando habitación:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo actualizar la habitación. Intenta nuevamente.'
          );
        }
      });
    } else {
      this.habitacionService.createHabitacion(habitacionData).subscribe({
        next: () => {
          this.cargarHabitaciones();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Habitación creada',
            `Habitación creada correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error creando habitación:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo crear la habitación. Intenta nuevamente.'
          );
        }
      });
    }
  }

  // Toggle disponibilidad
  toggleDisponibilidad(habitacion: Habitacion): void {
    if (!habitacion.id) {
      this.mostrarNotificacion('error', 'Error', 'No se puede cambiar la disponibilidad de una habitación sin ID');
      return;
    }

    const nuevaDisponibilidad = !habitacion.disponibilidad;
    this.guardando = true;
    
    this.habitacionService.toggleDisponibilidad(habitacion.id, nuevaDisponibilidad).subscribe({
      next: () => {
        this.cargarHabitaciones();
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Disponibilidad actualizada',
          `La habitación ahora está ${nuevaDisponibilidad ? 'disponible' : 'no disponible'}.`
        );
      },
      error: (error: any) => {
        console.error('Error cambiando disponibilidad:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo cambiar la disponibilidad. Intenta nuevamente.'
        );
      }
    });
  }

  // Método para ver detalles de una habitación
  verDetalles(habitacion: Habitacion): void {
    this.habitacionDetalles = habitacion;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('detallesModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para preparar la eliminación de una habitación
  eliminarHabitacion(habitacion: Habitacion): void {
    this.habitacionAEliminar = habitacion;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para confirmar la eliminación
  confirmarEliminar(): void {
    if (!this.habitacionAEliminar || this.habitacionAEliminar.id === undefined) {
      this.mostrarNotificacion('error', 'Error', 'No se puede eliminar la habitación porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    // Usar aserción no nula para id
    this.habitacionService.deleteHabitacion(this.habitacionAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Habitación eliminada', 
          `La habitación ha sido eliminada correctamente.`
        );
        this.cargarHabitaciones(); // Recargar la lista
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.habitacionAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando habitación:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo eliminar la habitación. Intenta nuevamente.'
        );
      }
    });
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
}