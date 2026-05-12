import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { HabitacionService } from '../../servicios/habitacion.service';
import { TipoHabitacionService } from '../../servicios/tipo-habitacion.service';
import { AuthService } from '../../servicios/auth.service';

// Modelos
import { Habitacion } from '../../modelos/habitacion.model';
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
  private tipoHabitacionService = inject(TipoHabitacionService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  // Formulario
  habitacionForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoTiposHabitacion: boolean = false;
  filtroTexto: string = '';
  formularioVisible: boolean = false;
  
  // Datos del hotel del empleado logueado
  hotelId: number | null = null;
  nombreHotel: string = '';
  empleadoId: number | null = null;
  
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
        Validators.min(1000),
        Validators.max(10000000)
      ]],
      disponibilidad: [true],
      caracteristicas: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      tipoHabitacionId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.obtenerHotelDelEmpleado();
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

  /**
   * Obtener el hotel asignado al empleado que ha iniciado sesión
   * Basado en las relaciones:
   * Usuario -> Empleado -> Hoteles
   */
  private obtenerHotelDelEmpleado(): void {
    try {
      // Obtener el usuario actual desde el servicio de autenticación
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        this.mostrarError('No se encontró información del usuario logueado');
        this.redirigirALogin();
        return;
      }
      
      // Obtener el hotel asociado al empleado
      // El AuthService debería tener un método que obtenga el empleado con su hotel
      this.authService.getEmpleadoConHotel().subscribe({
        next: (empleado: any) => {
          if (empleado && empleado.hotel && empleado.hotel.id) {
            this.hotelId = empleado.hotel.id;
            this.nombreHotel = empleado.hotel.nombre || 'Hotel';
            this.empleadoId = empleado.idEmpleado;
            
            console.log('Hotel asignado al empleado:', {
              empleadoId: this.empleadoId,
              hotelId: this.hotelId,
              nombreHotel: this.nombreHotel
            });
            
            // Una vez que tenemos el hotel, cargamos las habitaciones
            this.cargarHabitaciones();
          } else {
            this.mostrarError('El empleado no tiene un hotel asignado');
            this.hotelId = null;
            this.nombreHotel = 'Sin hotel asignado';
          }
        },
        error: (error) => {
          console.error('Error al obtener el empleado:', error);
          this.mostrarError('No se pudo obtener la información del empleado');
          this.hotelId = null;
          this.nombreHotel = 'Error al cargar hotel';
        }
      });
      
    } catch (error) {
      console.error('Error al obtener hotel del empleado:', error);
      this.mostrarError('Error al identificar el hotel del empleado');
    }
  }
  
  private redirigirALogin(): void {
    // Redirigir al login si es necesario
    // this.router.navigate(['/login']);
  }

  // Cargar tipos de habitación
  cargarTiposHabitacion(): void {
    this.cargandoTiposHabitacion = true;
    this.tipoHabitacionService.getTiposHabitacion().subscribe({
      next: (tipos: TipoHabitacion[]) => {
        this.tiposHabitacion = tipos || [];
        this.cargandoTiposHabitacion = false;
        
        if (tipos.length === 0) {
          this.mostrarInfo('No hay tipos de habitación disponibles. Contacta al administrador.');
        }
      },
      error: (error: any) => {
        console.error('Error cargando tipos de habitación:', error);
        this.mostrarError('No se pudieron cargar los tipos de habitación');
        this.cargandoTiposHabitacion = false;
        this.tiposHabitacion = [];
      }
    });
  }

  /**
   * Cargar habitaciones SOLO del hotel asignado al empleado
   * Relación: Hoteles (id = hotelId) -> Habitaciones
   */
  cargarHabitaciones(): void {
    if (!this.hotelId) {
      this.mostrarError('No se puede cargar habitaciones: Empleado sin hotel asignado');
      this.cargando = false;
      return;
    }
    
    this.cargando = true;
    // Usar el método que filtra por hotel
    this.habitacionService.getHabitacionesPorHotel(this.hotelId).subscribe({
      next: (habitaciones: Habitacion[]) => {
        this.habitaciones = habitaciones || [];
        this.habitacionesFiltradas = [...this.habitaciones];
        this.totalHabitaciones = this.habitaciones.length;
        this.cargando = false;
        
        if (habitaciones.length === 0) {
          this.mostrarInfo(`No hay habitaciones registradas para ${this.nombreHotel}`);
        } else {
          console.log(`Se cargaron ${habitaciones.length} habitaciones del hotel ${this.nombreHotel}`);
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

  private aplicarFiltros(): void {
    let resultado = [...this.habitaciones];
    
    if (this.filtroTexto) {
      resultado = resultado.filter(habitacion => {
        const texto = this.filtroTexto;
        const caracteristicas = habitacion.caracteristicas?.toLowerCase() || '';
        const nombreTipo = habitacion.tiposHabitaciones?.nombre?.toLowerCase() || '';
        const precio = habitacion.precioNoche?.toString() || '';

        return caracteristicas.includes(texto) ||
               nombreTipo.includes(texto) ||
               precio.includes(texto);
      });
      
      if (this.filtroTexto && resultado.length === 0 && this.habitaciones.length > 0) {
        this.mostrarInfo(`No se encontraron habitaciones con "${this.filtroTexto}"`);
      }
    }
    
    this.habitacionesFiltradas = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    if (!this.hotelId) {
      this.mostrarError('No se puede crear habitación: Empleado sin hotel asignado');
      return;
    }
    
    this.modoEdicion = false;
    this.habitacionEditando = null;
    this.formularioVisible = true;
    
    this.habitacionForm.reset({
      precioNoche: null,
      disponibilidad: true,
      caracteristicas: '',
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
  }

  // Editar habitación
  editarHabitacion(habitacion: Habitacion): void {
    // Verificar que la habitación pertenezca al hotel del empleado
    if (habitacion.hoteles?.id !== this.hotelId) {
      this.mostrarError('No puedes editar habitaciones de otro hotel');
      return;
    }
    
    this.modoEdicion = true;
    this.habitacionEditando = habitacion;
    this.formularioVisible = true;
    
    this.habitacionForm.patchValue({
      precioNoche: habitacion.precioNoche,
      disponibilidad: habitacion.disponibilidad,
      caracteristicas: habitacion.caracteristicas,
      tipoHabitacionId: habitacion.tiposHabitaciones?.id || ''
    });
  }

  /**
   * Guardar habitación (crear o actualizar)
   * IMPORTANTE: Se asigna automáticamente el hotelId del empleado
   */
  guardarHabitacion(): void {
    // Marcar todos los campos como tocados para mostrar validaciones
    Object.keys(this.habitacionForm.controls).forEach(key => {
      const control = this.habitacionForm.get(key);
      control?.markAsTouched();
    });

    if (this.habitacionForm.invalid) {
      this.mostrarError('Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    if (!this.hotelId) {
      this.mostrarError('No se puede guardar: Empleado sin hotel asignado');
      return;
    }

    if (this.tiposHabitacion.length === 0) {
      this.mostrarError('No hay tipos de habitación disponibles');
      return;
    }

    this.guardando = true;
    
    // Construir el objeto de datos con el hotelId del empleado
    const habitacionData = {
      precioNoche: this.habitacionForm.get('precioNoche')?.value,
      disponibilidad: this.habitacionForm.get('disponibilidad')?.value,
      caracteristicas: this.habitacionForm.get('caracteristicas')?.value,
      tipoHabitacionId: this.habitacionForm.get('tipoHabitacionId')?.value,
      hotelId: this.hotelId  // Asignar automáticamente el hotel del empleado
    };

    if (this.modoEdicion && this.habitacionEditando && this.habitacionEditando.id) {
      // Actualizar habitación existente
      this.habitacionService.updateHabitacion(this.habitacionEditando.id, habitacionData).subscribe({
        next: (response) => {
          console.log('Habitación actualizada:', response);
          this.cargarHabitaciones();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito('Habitación actualizada correctamente');
        },
        error: (error: any) => {
          console.error('Error actualizando habitación:', error);
          this.guardando = false;
          this.mostrarError(error.error?.message || 'No se pudo actualizar la habitación');
        }
      });
    } else {
      // Crear nueva habitación
      this.habitacionService.createHabitacion(habitacionData).subscribe({
        next: (response) => {
          console.log('Habitación creada:', response);
          this.cargarHabitaciones();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito('Habitación creada correctamente');
        },
        error: (error: any) => {
          console.error('Error creando habitación:', error);
          this.guardando = false;
          this.mostrarError(error.error?.message || 'No se pudo crear la habitación');
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
    
    // Verificar que la habitación pertenezca al hotel del empleado
    if (habitacion.hoteles?.id !== this.hotelId) {
      this.mostrarError('No puedes modificar habitaciones de otro hotel');
      return;
    }

    const nuevaDisponibilidad = !habitacion.disponibilidad;
    this.guardando = true;
    
    this.habitacionService.toggleDisponibilidad(habitacion.id, nuevaDisponibilidad).subscribe({
      next: () => {
        this.cargarHabitaciones();
        this.guardando = false;
        this.mostrarExito(`Habitación ${nuevaDisponibilidad ? 'disponible' : 'no disponible'}`);
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
    // Verificar que la habitación pertenezca al hotel del empleado
    if (habitacion.hoteles?.id !== this.hotelId) {
      this.mostrarError('No puedes eliminar habitaciones de otro hotel');
      return;
    }
    
    this.habitacionAEliminar = habitacion;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.habitacionAEliminar || !this.habitacionAEliminar.id) {
      this.mostrarError('No se puede eliminar la habitación');
      return;
    }

    this.guardando = true;
    
    this.habitacionService.deleteHabitacion(this.habitacionAEliminar.id).subscribe({
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
        this.mostrarError(error.error?.message || 'No se pudo eliminar la habitación');
      }
    });
  }

  // Formatear precios en XAF
  formatXAF(precio: number | null | undefined): string {
    if (precio === null || precio === undefined) {
      return '0 XAF';
    }
    
    const precioFormateado = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
    
    return `${precioFormateado} XAF`;
  }
}