import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { TipoHabitacionService } from '../../servicios/tipo-habitacion.service';

// Modelos
import { TipoHabitacion } from '../../modelos/tipo-habitacion.model';

@Component({
  selector: 'tipos-habitaciones',  
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './tipos-habitaciones.html',  // Template HTML
  styleUrls: ['./tipos-habitaciones.css']    // Estilos CSS
})
export class tiposHabitaciones implements OnInit, OnDestroy, AfterViewInit {
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
  formularioVisible: boolean = false;
  
  // Mensajes tipo toast
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
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
    // Formulario de tipo de habitación según la entidad
    this.tipoForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      capacidad: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(20)
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

  // Cargar tipos de habitación
  cargarTipos(): void {
    this.cargando = true;
    this.tipoService.getTiposHabitacion().subscribe({
      next: (tipos: TipoHabitacion[]) => {
        this.tipos = tipos || [];
        this.tiposFiltrados = [...this.tipos];
        this.totalTipos = this.tipos.length;
        this.cargando = false;
        
        if (tipos.length === 0) {
          this.mostrarInfo('No se encontraron tipos de habitaciones registrados');
        }
      },
      error: (error: any) => {
        console.error('Error cargando tipos de habitación:', error);
        this.mostrarError('No se pudieron cargar los tipos de habitación');
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
    
    if (this.filtroTexto) {
      resultado = resultado.filter(tipo =>
        tipo.nombre.toLowerCase().includes(this.filtroTexto) ||
        tipo.descripcion.toLowerCase().includes(this.filtroTexto)
      );
      
      if (this.filtroTexto && resultado.length === 0 && this.tipos.length > 0) {
        this.mostrarInfo(`No se encontraron tipos con "${this.filtroTexto}"`);
      }
    }
    
    this.tiposFiltrados = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.tipoEditando = null;
    this.formularioVisible = true;
    
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
    this.formularioVisible = false;
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
    this.formularioVisible = true;
    
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
    Object.keys(this.tipoForm.controls).forEach(key => {
      const control = this.tipoForm.get(key);
      control?.markAsTouched();
    });

    if (this.tipoForm.invalid) {
      this.mostrarError('Completa todos los campos requeridos correctamente.');
      return;
    }

    this.guardando = true;
    const tipoData = this.tipoForm.value;

    if (this.modoEdicion && this.tipoEditando && this.tipoEditando.id !== undefined) {
      this.tipoService.updateTipoHabitacion(this.tipoEditando.id!, tipoData).subscribe({
        next: () => {
          this.cargarTipos();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito(`Tipo de habitación "${tipoData.nombre}" actualizado correctamente.`);
        },
        error: (error: any) => {
          console.error('Error actualizando tipo de habitación:', error);
          this.guardando = false;
          this.mostrarError('No se pudo actualizar el tipo de habitación.');
        }
      });
    } else {
      this.tipoService.createTipoHabitacion(tipoData).subscribe({
        next: () => {
          this.cargarTipos();
          this.guardando = false;
          this.cancelarEdicion();
          this.mostrarExito(`Tipo de habitación "${tipoData.nombre}" creado correctamente.`);
        },
        error: (error: any) => {
          console.error('Error creando tipo de habitación:', error);
          this.guardando = false;
          this.mostrarError('No se pudo crear el tipo de habitación.');
        }
      });
    }
  }

  // Ver detalles
  verDetalles(tipo: TipoHabitacion): void {
    this.tipoDetalles = tipo;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar tipo
  eliminarTipo(tipo: TipoHabitacion): void {
    this.tipoAEliminar = tipo;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.tipoAEliminar || this.tipoAEliminar.id === undefined) {
      this.mostrarError('No se puede eliminar el tipo porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    this.tipoService.deleteTipoHabitacion(this.tipoAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarExito(`El tipo "${this.tipoAEliminar!.nombre}" ha sido eliminado correctamente.`);
        this.cargarTipos();
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.tipoAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando tipo de habitación:', error);
        this.guardando = false;
        this.mostrarError('No se pudo eliminar el tipo de habitación.');
      }
    });
  }
}