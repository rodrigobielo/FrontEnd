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
    this.destroyModales();
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
      },
      error: (error: any) => {
        console.error('Error al cargar provincias:', error);
        this.cargandoProvincias = false;
        this.mostrarMensajeError('Error al cargar las provincias');
        this.provincias = [];
      }
    });
  }

  /**
   * Cargar ciudades
   */
  cargarCiudades(): void {
    this.cargando = true;
    this.ciudadService.getAll().subscribe({
      next: (data: Ciudad[]) => {
        this.ciudades = data;
        this.ciudadesFiltradas = [...this.ciudades];
        this.totalCiudades = this.ciudades.length;
        this.cargando = false;
        this.paginaActual = 1;
      },
      error: (error: any) => {
        console.error('Error al cargar ciudades:', error);
        this.cargando = false;
        this.mostrarMensajeError('Error al cargar las ciudades');
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
  }

  /**
   * Cerrar formulario
   */
  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset();
  }

  /**
   * Aplicar filtros
   */
  private aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.ciudades];
    
    if (this.filtroProvincia > 0) {
      resultado = resultado.filter(c => c.provinciaId === this.filtroProvincia);
    }
    
    if (filtroTexto) {
      resultado = resultado.filter(ciudad =>
        ciudad.nombre.toLowerCase().includes(filtroTexto) ||
        ciudad.descripcion.toLowerCase().includes(filtroTexto) ||
        this.obtenerNombreProvincia(ciudad.provinciaId).toLowerCase().includes(filtroTexto)
      );
    }
    
    this.ciudadesFiltradas = resultado;
    this.paginaActual = 1;
  }

  /**
   * Filtrar ciudades por búsqueda
   */
  filtrarCiudades(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    this.aplicarFiltros(filtro);
  }

  /**
   * Filtrar ciudades por provincia
   */
  filtrarPorProvincia(provinciaId: number): void {
    this.filtroProvincia = provinciaId;
    this.aplicarFiltros('');
  }

  /**
   * Editar ciudad
   */
  editarCiudad(ciudad: Ciudad): void {
    this.modoEdicion = true;
    this.ciudadEditando = ciudad;
    this.formularioVisible = true;
    
    this.ciudadForm.patchValue({
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provinciaId: ciudad.provinciaId
    });
    
    this.ciudadForm.markAsPristine();
    Object.keys(this.ciudadForm.controls).forEach(key => {
      this.ciudadForm.get(key)?.markAsUntouched();
    });
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
      this.mostrarMensajeError('Complete todos los campos obligatorios');
      return;
    }

    this.guardando = true;
    const ciudadData: CiudadDTO = this.ciudadForm.value;
    
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
          this.mostrarMensajeExito(`Ciudad "${ciudadData.nombre}" actualizada`);
        },
        error: (error: any) => {
          console.error('Error al actualizar ciudad:', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al actualizar la ciudad');
        }
      });
    } else {
      this.ciudadService.create(ciudadData).subscribe({
        next: (nuevaCiudad: Ciudad) => {
          this.ciudades.unshift(nuevaCiudad);
          this.totalCiudades = this.ciudades.length;
          this.aplicarFiltros('');
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarMensajeExito(`Ciudad "${ciudadData.nombre}" creada`);
        },
        error: (error: any) => {
          console.error('Error al crear ciudad:', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al crear la ciudad');
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
          
          this.mostrarMensajeExito(`Ciudad "${ciudadAEliminar.nombre}" eliminada`);
        }
        this.ciudadAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error al eliminar ciudad:', error);
        this.mostrarMensajeError('Error al eliminar la ciudad');
      }
    });
  }

  private mostrarMensajeExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  private mostrarMensajeError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }
}