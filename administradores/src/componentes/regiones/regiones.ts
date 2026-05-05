// regiones.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { Region } from '../../modelos/region.model';
import { RegionService } from '../../servicios/region.service';

@Component({
  selector: 'app-regiones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './regiones.html',
  styleUrls: ['./regiones.css']
})
export class Regiones implements OnInit, OnDestroy {
  // Propiedades del formulario
  regionForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  formularioVisible: boolean = false;
  
  // Datos de regiones
  regiones: Region[] = [];
  regionesFiltradas: Region[] = [];
  regionEditando: Region | null = null;
  regionAEliminar: Region | null = null;
  
  // Estadísticas
  totalRegiones: number = 0;
  
  // Propiedades para paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  
  // Mensajes con toasts
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Temporizadores para mensajes
  private timeoutExito: any;
  private timeoutError: any;
  private timeoutInfo: any;

  constructor(
    private fb: FormBuilder,
    private regionService: RegionService
  ) {
    // Inicializar formulario con validaciones
    this.regionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      codigo: ['', [Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    this.cargarRegiones();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
  }

  private limpiarTemporizadores(): void {
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    if (this.timeoutError) clearTimeout(this.timeoutError);
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
  }

  private mostrarExito(mensaje: string): void {
    this.mostrarMensajeExito = true;
    this.mensajeExito = mensaje;
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    this.timeoutExito = setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensajeExito = '';
    }, 4000);
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    if (this.timeoutError) clearTimeout(this.timeoutError);
    this.timeoutError = setTimeout(() => {
      this.mostrarMensajeError = false;
      this.mensajeError = '';
    }, 5000);
  }

  private mostrarInfo(mensaje: string): void {
    this.mostrarMensajeInfo = true;
    this.mensajeInfo = mensaje;
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
    this.timeoutInfo = setTimeout(() => {
      this.mostrarMensajeInfo = false;
      this.mensajeInfo = '';
    }, 3000);
  }

  /**
   * Cargar todas las regiones desde el servicio
   */
  cargarRegiones(): void {
    this.cargando = true;
    this.limpiarTemporizadores();
    
    this.regionService.obtenerRegiones().subscribe({
      next: (regiones: Region[]) => {
        this.regiones = regiones;
        this.regionesFiltradas = [...this.regiones];
        this.totalRegiones = this.regiones.length;
        this.cargando = false;
        this.paginaActual = 1;
        
        if (regiones.length === 0) {
          this.mostrarInfo('No se encontraron regiones registradas');
        }
      },
      error: (error: Error) => {
        console.error('Error al cargar regiones', error);
        this.cargando = false;
        this.mostrarError(error.message || 'Error al cargar las regiones');
      }
    });
  }

  /**
   * Mostrar el formulario para crear una nueva región
   */
  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.modoEdicion = false;
    this.regionEditando = null;
    this.regionForm.reset();
    this.regionForm.markAsPristine();
    this.regionForm.markAsUntouched();
    this.limpiarTemporizadores();
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.modern-form');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Cerrar el formulario y limpiar datos
   */
  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.regionEditando = null;
    this.regionForm.reset();
    this.limpiarTemporizadores();
  }

  /**
   * Filtrar regiones según el texto de búsqueda
   */
  filtrarRegiones(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    if (filtro) {
      this.regionesFiltradas = this.regiones.filter(region =>
        region.nombre.toLowerCase().includes(filtro) ||
        region.descripcion.toLowerCase().includes(filtro) ||
        (region.codigo && region.codigo.toLowerCase().includes(filtro))
      );
      
      if (this.regionesFiltradas.length === 0) {
        this.mostrarInfo(`No se encontraron regiones con "${filtro}"`);
      }
    } else {
      this.regionesFiltradas = [...this.regiones];
    }
    
    this.paginaActual = 1;
  }

  /**
   * Preparar el formulario para editar una región existente
   */
  editarRegion(region: Region): void {
    this.modoEdicion = true;
    this.regionEditando = region;
    this.formularioVisible = true;
    this.limpiarTemporizadores();
    
    // Cargar datos de la región en el formulario
    this.regionForm.patchValue({
      nombre: region.nombre,
      descripcion: region.descripcion,
      codigo: region.codigo || ''
    });
    
    // Marcar campos como untouched para no mostrar errores inmediatamente
    this.regionForm.markAsPristine();
    Object.keys(this.regionForm.controls).forEach(key => {
      this.regionForm.get(key)?.markAsUntouched();
    });
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.modern-form');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Guardar una región (crear o actualizar)
   */
  guardarRegion(): void {
    // Validar formulario
    if (this.regionForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.regionForm.controls).forEach(key => {
        const control = this.regionForm.get(key);
        control?.markAsTouched();
      });
      this.mostrarError('Por favor, complete correctamente todos los campos obligatorios.');
      return;
    }

    this.guardando = true;
    const regionData = this.regionForm.value;
    const nombreRegion = regionData.nombre;

    if (this.modoEdicion && this.regionEditando) {
      // Validar que exista el ID para actualizar
      if (!this.regionEditando.id) {
        console.error('No se puede actualizar: ID no definido');
        this.guardando = false;
        this.mostrarError('Error: No se pudo identificar la región a actualizar');
        return;
      }

      // Actualizar región existente
      this.regionService.actualizarRegion(this.regionEditando.id, regionData).subscribe({
        next: (regionActualizada: Region) => {
          const index = this.regiones.findIndex(r => r.id === regionActualizada.id);
          if (index !== -1) {
            this.regiones[index] = regionActualizada;
          }
          this.regionesFiltradas = [...this.regiones];
          this.totalRegiones = this.regiones.length;
          this.guardando = false;
          this.cerrarFormulario(); // Cerrar formulario automáticamente
          this.mostrarExito(`✅ Región "${nombreRegion}" actualizada correctamente`);
        },
        error: (error: Error) => {
          console.error('Error al actualizar región', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al actualizar la región');
        }
      });
    } else {
      // Crear nueva región
      this.regionService.crearRegion(regionData).subscribe({
        next: (nuevaRegion: Region) => {
          this.regiones.unshift(nuevaRegion);
          this.totalRegiones = this.regiones.length;
          this.regionesFiltradas = [...this.regiones];
          this.guardando = false;
          this.cerrarFormulario(); // Cerrar formulario automáticamente
          this.mostrarExito(`✅ Región "${nombreRegion}" creada correctamente`);
          
          // Resetear página a la primera para ver la nueva región
          this.paginaActual = 1;
        },
        error: (error: Error) => {
          console.error('Error al crear región', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al crear la región');
        }
      });
    }
  }

  /**
   * Ver detalles de una región
   */
  verDetalles(region: Region): void {
    const mensaje = `📍 REGIÓN: ${region.nombre}\n\n${region.codigo ? `🔑 Código: ${region.codigo}\n\n` : ''}📝 Descripción:\n${region.descripcion}\n\n📅 ID: ${region.id}${region.fechaCreacion ? `\n📆 Creada: ${new Date(region.fechaCreacion).toLocaleDateString()}` : ''}`;
    alert(mensaje);
  }

  /**
   * Preparar eliminación de una región (mostrar modal)
   */
  eliminarRegion(region: Region): void {
    this.regionAEliminar = region;
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Confirmar y ejecutar eliminación de región
   */
  confirmarEliminar(): void {
    if (this.regionAEliminar && this.regionAEliminar.id) {
      const nombreRegion = this.regionAEliminar.nombre;
      
      this.regionService.eliminarRegion(this.regionAEliminar.id).subscribe({
        next: () => {
          const index = this.regiones.findIndex(r => r.id === this.regionAEliminar!.id);
          if (index !== -1) {
            this.regiones.splice(index, 1);
            this.regionesFiltradas = [...this.regiones];
            this.totalRegiones = this.regiones.length;
          }
          
          // Cerrar modal
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
          
          // Si el formulario estaba editando esta región, cerrarlo
          if (this.regionEditando?.id === this.regionAEliminar?.id) {
            this.cerrarFormulario();
          }
          
          this.mostrarExito(`🗑️ Región "${nombreRegion}" eliminada correctamente`);
          
          // Si no quedan regiones, mostrar mensaje
          if (this.regiones.length === 0) {
            this.mostrarInfo('No hay regiones registradas');
          }
        },
        error: (error: Error) => {
          console.error('Error al eliminar región', error);
          this.mostrarError(error.message || 'Error al eliminar la región');
          
          // Cerrar modal en caso de error
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        }
      });
    } else {
      console.error('No se puede eliminar: región o ID no definido');
      this.mostrarError('Error: No se pudo identificar la región a eliminar');
      
      // Cerrar modal
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
    this.regionAEliminar = null;
  }
}