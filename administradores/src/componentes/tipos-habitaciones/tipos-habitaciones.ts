import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { TipoHabitacionService } from '../../servicios/tipo-habitacion.service';

// Modelos
import { TipoHabitacion, TipoHabitacionFormData } from '../../modelos/tipo-habitacion.model';

@Component({
  selector: 'app-tipos-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './tipos-habitaciones.html',
  styleUrls: ['./tipos-habitaciones.css']
})
export class TiposHabitaciones implements OnInit, OnDestroy, AfterViewInit {
  // Inyección de servicios
  private tipoService = inject(TipoHabitacionService);
  private fb = inject(FormBuilder);
  
  // Formulario
  tipoForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  filtroTexto: string = '';
  
  // Datos
  tipos: TipoHabitacion[] = [];
  tiposFiltrados: TipoHabitacion[] = [];
  tipoEditando: TipoHabitacion | null = null;
  tipoDetalles: TipoHabitacion | null = null;
  tipoAEliminar: TipoHabitacion | null = null;
  
  // Estadísticas
  totalTipos: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor() {
    // Formulario de tipo de habitación con valores por defecto
    this.tipoForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10)
      ]],
      capacidad: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]],
      numeroCamas: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]],
      aireAcondicionador: [false],
      minibar: [false],
      television: [false]
    });
  }

  ngOnInit(): void {
    this.cargarTipos();
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

  // Cargar tipos de habitación
  cargarTipos(): void {
    this.cargando = true;
    this.tipoService.getTiposHabitacion().subscribe({
      next: (tipos: TipoHabitacion[]) => {
        this.tipos = tipos || [];
        this.tiposFiltrados = [...this.tipos];
        this.totalTipos = this.tipos.length;
        this.cargando = false;
        console.log('Tipos de habitación cargados:', this.tipos);
      },
      error: (error: any) => {
        console.error('Error cargando tipos de habitación:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los tipos de habitación');
        this.cargando = false;
        this.tipos = [];
        this.tiposFiltrados = [];
      }
    });
  }

  // Filtrar tipos por texto
  filtrarTipos(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.tipos];
    
    // Filtrar por texto
    if (this.filtroTexto) {
      resultado = resultado.filter(tipo =>
        tipo.nombre.toLowerCase().includes(this.filtroTexto) ||
        tipo.descripcion.toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.tiposFiltrados = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.tipoEditando = null;
    
    this.tipoForm.reset({
      nombre: '',
      descripcion: '',
      capacidad: 1,
      numeroCamas: 1,
      aireAcondicionador: false,
      minibar: false,
      television: false
    });
    
    this.tipoForm.markAsPristine();
    this.tipoForm.markAsUntouched();
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.tipoEditando = null;
    this.tipoForm.reset();
    this.tipoForm.markAsPristine();
    this.tipoForm.markAsUntouched();
  }

  // Editar tipo
  editarTipo(tipo: TipoHabitacion): void {
    this.modoEdicion = true;
    this.tipoEditando = tipo;
    
    this.tipoForm.patchValue({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      capacidad: tipo.capacidad,
      numeroCamas: tipo.numeroCamas,
      aireAcondicionador: tipo.aireAcondicionador || false,
      minibar: tipo.minibar || false,
      television: tipo.television || false
    });
  }

  // Guardar tipo
  guardarTipo(): void {
    // Marcar todos los controles como tocados para mostrar errores
    Object.keys(this.tipoForm.controls).forEach(key => {
      const control = this.tipoForm.get(key);
      control?.markAsTouched();
    });

    if (this.tipoForm.invalid) {
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
      return;
    }

    this.guardando = true;
    const tipoData = this.tipoForm.value;

    // Usar aserción no nula para id en modo edición
    if (this.modoEdicion && this.tipoEditando && this.tipoEditando.id !== undefined) {
      this.tipoService.updateTipoHabitacion(this.tipoEditando.id!, tipoData).subscribe({
        next: () => {
          this.cargarTipos();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Tipo actualizado',
            `Tipo de habitación "${tipoData.nombre}" actualizado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error actualizando tipo de habitación:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo actualizar el tipo de habitación. Intenta nuevamente.'
          );
        }
      });
    } else {
      this.tipoService.createTipoHabitacion(tipoData).subscribe({
        next: () => {
          this.cargarTipos();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Tipo creado',
            `Tipo de habitación "${tipoData.nombre}" creado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error creando tipo de habitación:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo crear el tipo de habitación. Intenta nuevamente.'
          );
        }
      });
    }
  }

  // Método para ver detalles de un tipo
  verDetalles(tipo: TipoHabitacion): void {
    this.tipoDetalles = tipo;
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

  // Método para preparar la eliminación de un tipo
  eliminarTipo(tipo: TipoHabitacion): void {
    this.tipoAEliminar = tipo;
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
    if (!this.tipoAEliminar || this.tipoAEliminar.id === undefined) {
      this.mostrarNotificacion('error', 'Error', 'No se puede eliminar el tipo porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    // Usar aserción no nula para id
    this.tipoService.deleteTipoHabitacion(this.tipoAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Tipo eliminado', 
          `El tipo "${this.tipoAEliminar!.nombre}" ha sido eliminado correctamente.`
        );
        this.cargarTipos(); // Recargar la lista
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.tipoAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando tipo de habitación:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo eliminar el tipo de habitación. Intenta nuevamente.'
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