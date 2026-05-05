import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProvinciaService } from '../../servicios/provincia.service';
import { CiudadService } from '../../servicios/ciudades.service';
import { ProvinciaSimple } from '../../modelos/provincia.model';
import { Ciudad, CiudadDTO } from '../../modelos/ciudad.model';

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css']
})
export class Ciudades implements OnInit, OnDestroy {
  // Propiedades del formulario
  ciudadForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoProvincias: boolean = false;
  formularioVisible: boolean = false;
  filtroProvincia: number = 0;
  
  // Mensajes con toasts
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Datos
  provincias: ProvinciaSimple[] = [];
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  ciudadEditando: Ciudad | null = null;
  ciudadDetalles: Ciudad | null = null;
  ciudadAEliminar: Ciudad | null = null;
  
  // Estadísticas
  totalCiudades: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  
  // Temporizadores
  private timeoutExito: any;
  private timeoutError: any;
  private timeoutInfo: any;
  
  // Modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(
    private fb: FormBuilder,
    private provinciaService: ProvinciaService,
    private ciudadService: CiudadService
  ) {
    this.ciudadForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      provinciaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarProvincias();
    this.cargarCiudades();
    this.initModales();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
    this.destroyModales();
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

  private initModales(): void {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const detallesElement = document.getElementById('detallesModal');
      const confirmarElement = document.getElementById('confirmarEliminarModal');
      
      if (detallesElement) {
        this.detallesModalInstance = new (window as any).bootstrap.Modal(detallesElement);
      }
      if (confirmarElement) {
        this.confirmarModalInstance = new (window as any).bootstrap.Modal(confirmarElement);
      }
    }
  }

  private destroyModales(): void {
    if (this.detallesModalInstance) {
      this.detallesModalInstance.dispose();
      this.detallesModalInstance = null;
    }
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.dispose();
      this.confirmarModalInstance = null;
    }
  }

  /**
   * Cargar provincias
   */
  cargarProvincias(): void {
    this.cargandoProvincias = true;
    this.provinciaService.getAll().subscribe({
      next: (data: ProvinciaSimple[]) => {
        this.provincias = data;
        this.cargandoProvincias = false;
        
        if (data.length === 0) {
          this.mostrarInfo('No hay provincias disponibles. Debes crear provincias primero.');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar provincias:', error);
        this.cargandoProvincias = false;
        this.mostrarError('Error al cargar las provincias');
        this.provincias = [];
      }
    });
  }

  /**
   * Cargar ciudades
   */
  cargarCiudades(): void {
    this.cargando = true;
    this.limpiarTemporizadores();
    
    this.ciudadService.getAll().subscribe({
      next: (data: Ciudad[]) => {
        this.ciudades = data;
        this.ciudadesFiltradas = [...this.ciudades];
        this.totalCiudades = this.ciudades.length;
        this.cargando = false;
        this.paginaActual = 1;
        
        if (data.length === 0) {
          this.mostrarInfo('No se encontraron ciudades registradas');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar ciudades:', error);
        this.cargando = false;
        this.mostrarError(error.message || 'Error al cargar las ciudades');
        this.ciudades = [];
        this.ciudadesFiltradas = [];
        this.totalCiudades = 0;
      }
    });
  }

  /**
   * Obtener nombre de provincia por ID
   */
  obtenerNombreProvincia(provinciaId: number): string {
    if (!provinciaId) return 'Sin provincia';
    const provincia = this.provincias.find(p => p.id === provinciaId);
    return provincia ? provincia.nombre : `Provincia ${provinciaId}`;
  }

  /**
   * Mostrar formulario
   */
  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset({
      nombre: '',
      descripcion: '',
      provinciaId: ''
    });
    this.ciudadForm.markAsPristine();
    this.ciudadForm.markAsUntouched();
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
   * Cerrar formulario
   */
  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset();
    this.limpiarTemporizadores();
  }

  /**
   * Aplicar filtros
   */
  private aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.ciudades];
    
    if (this.filtroProvincia > 0) {
      resultado = resultado.filter(c => c.provinciaId === this.filtroProvincia);
      const nombreProvincia = this.obtenerNombreProvincia(this.filtroProvincia);
      if (resultado.length === 0 && this.ciudades.length > 0) {
        this.mostrarInfo(`No hay ciudades en la provincia "${nombreProvincia}"`);
      }
    }
    
    if (filtroTexto && filtroTexto.trim()) {
      const filtro = filtroTexto.toLowerCase().trim();
      resultado = resultado.filter(ciudad =>
        ciudad.nombre.toLowerCase().includes(filtro) ||
        ciudad.descripcion.toLowerCase().includes(filtro) ||
        this.obtenerNombreProvincia(ciudad.provinciaId).toLowerCase().includes(filtro)
      );
      
      if (resultado.length === 0) {
        this.mostrarInfo(`No se encontraron ciudades con "${filtro}"`);
      }
    }
    
    this.ciudadesFiltradas = resultado;
    this.paginaActual = 1;
  }

  /**
   * Filtrar ciudades por búsqueda
   */
  filtrarCiudades(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value;
    this.aplicarFiltros(filtro);
  }

  /**
   * Filtrar ciudades por provincia
   */
  filtrarPorProvincia(provinciaId: number): void {
    this.filtroProvincia = provinciaId;
    
    if (provinciaId > 0) {
      const nombreProvincia = this.obtenerNombreProvincia(provinciaId);
      this.mostrarExito(`Mostrando ciudades de "${nombreProvincia}"`);
    } else {
      this.mostrarInfo('Mostrando todas las ciudades');
    }
    
    this.aplicarFiltros('');
  }

  /**
   * Editar ciudad
   */
  editarCiudad(ciudad: Ciudad): void {
    this.modoEdicion = true;
    this.ciudadEditando = ciudad;
    this.formularioVisible = true;
    this.limpiarTemporizadores();
    
    this.ciudadForm.patchValue({
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provinciaId: ciudad.provinciaId
    });
    
    this.ciudadForm.markAsPristine();
    Object.keys(this.ciudadForm.controls).forEach(key => {
      this.ciudadForm.get(key)?.markAsUntouched();
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
   * Guardar ciudad
   */
  guardarCiudad(): void {
    if (this.ciudadForm.invalid) {
      Object.keys(this.ciudadForm.controls).forEach(key => {
        const control = this.ciudadForm.get(key);
        control?.markAsTouched();
      });
      this.mostrarError('Complete todos los campos obligatorios correctamente');
      return;
    }

    this.guardando = true;
    const ciudadData: CiudadDTO = this.ciudadForm.value;
    const nombreCiudad = ciudadData.nombre;
    
    if (this.modoEdicion && this.ciudadEditando) {
      this.ciudadService.update(this.ciudadEditando.id, ciudadData).subscribe({
        next: (ciudadActualizada: Ciudad) => {
          const index = this.ciudades.findIndex(c => c.id === ciudadActualizada.id);
          if (index !== -1) {
            this.ciudades[index] = ciudadActualizada;
          }
          this.aplicarFiltros('');
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Ciudad "${nombreCiudad}" actualizada correctamente`);
        },
        error: (error: any) => {
          console.error('Error al actualizar ciudad:', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al actualizar la ciudad');
        }
      });
    } else {
      this.ciudadService.create(ciudadData).subscribe({
        next: (nuevaCiudad: Ciudad) => {
          this.ciudades.unshift(nuevaCiudad);
          this.totalCiudades = this.ciudades.length;
          
          // Aplicar filtro si estaba activo
          if (this.filtroProvincia === 0 || nuevaCiudad.provinciaId === this.filtroProvincia) {
            this.ciudadesFiltradas.unshift(nuevaCiudad);
          }
          
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Ciudad "${nombreCiudad}" creada correctamente`);
          this.paginaActual = 1;
        },
        error: (error: any) => {
          console.error('Error al crear ciudad:', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al crear la ciudad');
        }
      });
    }
  }

  /**
   * Ver detalles
   */
  verDetalles(ciudad: Ciudad): void {
    this.ciudadDetalles = ciudad;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  /**
   * Eliminar ciudad
   */
  eliminarCiudad(ciudad: Ciudad): void {
    this.ciudadAEliminar = ciudad;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  /**
   * Confirmar eliminación
   */
  confirmarEliminar(): void {
    if (!this.ciudadAEliminar) return;
    
    const ciudadAEliminar = this.ciudadAEliminar;
    const nombreCiudad = ciudadAEliminar.nombre;
    
    this.ciudadService.delete(ciudadAEliminar.id).subscribe({
      next: () => {
        const index = this.ciudades.findIndex(c => c.id === ciudadAEliminar.id);
        if (index !== -1) {
          this.ciudades.splice(index, 1);
          this.totalCiudades = this.ciudades.length;
          this.aplicarFiltros('');
          
          if (this.confirmarModalInstance) {
            this.confirmarModalInstance.hide();
          }
          
          if (this.ciudadEditando?.id === ciudadAEliminar.id) {
            this.cerrarFormulario();
          }
          
          this.mostrarExito(`🗑️ Ciudad "${nombreCiudad}" eliminada correctamente`);
          
          if (this.ciudades.length === 0) {
            this.mostrarInfo('No hay ciudades registradas');
          }
        }
        this.ciudadAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error al eliminar ciudad:', error);
        this.mostrarError(error.message || 'Error al eliminar la ciudad');
        this.ciudadAEliminar = null;
      }
    });
  }
}