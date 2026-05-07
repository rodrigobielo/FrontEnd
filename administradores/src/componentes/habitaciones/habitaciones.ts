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
  formularioVisible: boolean = false;
  
  // Mensajes tipo toast
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
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

  private limpiarTemporizadores(): void {
    // Para compatibilidad con los timeout (se manejan en mostrar mensajes)
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
        this.mostrarError('No se pudieron cargar los hoteles');
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
        this.mostrarError('No se pudieron cargar los tipos de habitación');
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
        
        if (habitaciones.length === 0) {
          this.mostrarInfo('No se encontraron habitaciones registradas');
        }
      },
      error: (error: any) => {
        console.error('Error cargando habitaciones:', error);
        this.mostrarError('No se pudieron cargar las habitaciones');
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

  // Filtrar por hotel
  filtrarPorHotel(hotelId: number | undefined): void {
    this.filtroHotel = hotelId === undefined || hotelId === 0 ? null : hotelId;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.habitaciones];
    
    if (this.filtroHotel) {
      resultado = resultado.filter(h => h.hoteles?.id === this.filtroHotel);
    }
    
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
      
      if (this.filtroTexto && resultado.length === 0 && this.habitaciones.length > 0) {
        this.mostrarInfo(`No se encontraron habitaciones con "${this.filtroTexto}"`);
      }
    }
    
    this.habitacionesFiltradas = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.habitacionEditando = null;
    this.formularioVisible = true;
    
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
    this.formularioVisible = false;
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
    this.formularioVisible = true;
    
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
    Object.keys(this.habitacionForm.controls).forEach(key => {
      const control = this.habitacionForm.get(key);
      control?.markAsTouched();
    });

    if (this.habitacionForm.invalid) {
      this.mostrarError('Completa todos los campos requeridos correctamente.');
      return;
    }

    if (this.hoteles.length === 0) {
      this.mostrarError('No hay hoteles disponibles en la base de datos.');
      return;
    }

    if (this.tiposHabitacion.length === 0) {
      this.mostrarError('No hay tipos de habitación disponibles en la base de datos.');
      return;
    }

    this.guardando = true;
    const habitacionData = this.habitacionForm.value;

    if (this.modoEdicion && this.habitacionEditando && this.habitacionEditando.id !== undefined) {
      this.habitacionService.updateHabitacion(this.habitacionEditando.id!, habitacionData).subscribe({
        next: () => {
          this.cargarHabitaciones();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito('Habitación actualizada correctamente');
        },
        error: (error: any) => {
          console.error('Error actualizando habitación:', error);
          this.guardando = false;
          this.mostrarError('No se pudo actualizar la habitación');
        }
      });
    } else {
      this.habitacionService.createHabitacion(habitacionData).subscribe({
        next: () => {
          this.cargarHabitaciones();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito('Habitación creada correctamente');
        },
        error: (error: any) => {
          console.error('Error creando habitación:', error);
          this.guardando = false;
          this.mostrarError('No se pudo crear la habitación');
        }
      });
    }
  }

  // Toggle disponibilidad
  toggleDisponibilidad(habitacion: Habitacion): void {
    if (!habitacion.id) {
      this.mostrarError('No se puede cambiar la disponibilidad');
      return;
    }

    const nuevaDisponibilidad = !habitacion.disponibilidad;
    this.guardando = true;
    
    this.habitacionService.toggleDisponibilidad(habitacion.id, nuevaDisponibilidad).subscribe({
      next: () => {
        this.cargarHabitaciones();
        this.guardando = false;
        this.mostrarExito(`Habitación ahora está ${nuevaDisponibilidad ? 'disponible' : 'no disponible'}`);
      },
      error: (error: any) => {
        console.error('Error cambiando disponibilidad:', error);
        this.guardando = false;
        this.mostrarError('No se pudo cambiar la disponibilidad');
      }
    });
  }

  // Ver detalles
  verDetalles(habitacion: Habitacion): void {
    this.habitacionDetalles = habitacion;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar habitación
  eliminarHabitacion(habitacion: Habitacion): void {
    this.habitacionAEliminar = habitacion;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.habitacionAEliminar || this.habitacionAEliminar.id === undefined) {
      this.mostrarError('No se puede eliminar la habitación');
      return;
    }

    this.guardando = true;
    
    this.habitacionService.deleteHabitacion(this.habitacionAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarExito('Habitación eliminada correctamente');
        this.cargarHabitaciones();
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.habitacionAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando habitación:', error);
        this.guardando = false;
        this.mostrarError('No se pudo eliminar la habitación');
      }
    });
  }
  // Método para formatear precios en XAF (Franco CFA)
formatXAF(precio: number | null | undefined): string {
  if (precio === null || precio === undefined) {
    return '0 XAF';
  }
  
  // Formatear el número con separadores de miles
  const precioFormateado = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
  
  return `${precioFormateado} XAF`;
}
}