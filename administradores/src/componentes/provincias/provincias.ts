import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProvinciaService } from '../../servicios/provincia.service';
import { RegionService } from '../../servicios/region.service';
import { Region } from '../../modelos/region.model';
import { Provincia } from '../../modelos/provincia.model';

@Component({
  selector: 'app-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './provincias.html',
  styleUrls: ['./provincias.css']
})
export class Provincias implements OnInit, OnDestroy {
  // Propiedades del formulario
  provinciaForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoRegiones: boolean = false;
  formularioVisible: boolean = false;
  filtroRegion: number = 0;
  
  // Datos
  regiones: Region[] = [];
  provincias: Provincia[] = [];
  provinciasFiltradas: Provincia[] = [];
  provinciaEditando: Provincia | null = null;
  provinciaAEliminar: Provincia | null = null;
  
  // Estadísticas
  totalProvincias: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private fb: FormBuilder,
    private provinciaService: ProvinciaService,
    private regionService: RegionService
  ) {
    this.provinciaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      regionId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarRegiones();
    this.cargarProvincias();
  }

  ngOnDestroy(): void {}

  /**
   * Cargar regiones para el select
   */
  cargarRegiones(): void {
    this.cargandoRegiones = true;
    this.regionService.obtenerRegiones().subscribe({
      next: (regiones: Region[]) => {
        this.regiones = regiones;
        this.cargandoRegiones = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar regiones:', error);
        this.cargandoRegiones = false;
        this.mostrarMensajeError(error.message || 'Error al cargar las regiones');
      }
    });
  }

  /**
   * Cargar todas las provincias
   */
  cargarProvincias(): void {
    this.cargando = true;
    this.provinciaService.obtenerProvincias().subscribe({
      next: (provincias: Provincia[]) => {
        this.provincias = provincias;
        this.provinciasFiltradas = [...this.provincias];
        this.totalProvincias = provincias.length;
        this.cargando = false;
        this.paginaActual = 1;
      },
      error: (error: Error) => {
        console.error('Error al cargar provincias:', error);
        this.cargando = false;
        this.mostrarMensajeError(error.message || 'Error al cargar las provincias');
      }
    });
  }

  /**
   * Obtener nombre de región por provincia
   */
  obtenerNombreRegion(provincia: Provincia): string {
    if (!provincia.regiones?.id) {
      return 'Sin región asignada';
    }
    const region = this.regiones.find(r => r.id === provincia.regiones!.id);
    return region ? region.nombre : `Región ${provincia.regiones.id}`;
  }

  /**
   * Obtener nombre de región por ID
   */
  obtenerNombreRegionPorId(regionId: number): string {
    if (!regionId) return 'Todas las regiones';
    const region = this.regiones.find(r => r.id === regionId);
    return region ? region.nombre : `Región ${regionId}`;
  }

  /**
   * Mostrar formulario
   */
  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.modoEdicion = false;
    this.provinciaEditando = null;
    this.provinciaForm.reset({
      nombre: '',
      regionId: ''
    });
    this.provinciaForm.markAsPristine();
    this.provinciaForm.markAsUntouched();
  }

  /**
   * Cerrar formulario
   */
  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.provinciaEditando = null;
    this.provinciaForm.reset();
  }

  /**
   * Filtrar provincias por búsqueda
   */
  filtrarProvincias(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    if (filtro) {
      this.provinciasFiltradas = this.provincias.filter(provincia =>
        provincia.nombre.toLowerCase().includes(filtro) ||
        this.obtenerNombreRegion(provincia).toLowerCase().includes(filtro)
      );
    } else {
      this.provinciasFiltradas = [...this.provincias];
    }
    this.paginaActual = 1;
  }

  /**
   * Filtrar provincias por región
   */
  filtrarPorRegion(regionId: number): void {
    this.filtroRegion = regionId;
    if (regionId > 0) {
      this.provinciasFiltradas = this.provincias.filter(provincia =>
        provincia.regiones?.id === regionId
      );
    } else {
      this.provinciasFiltradas = [...this.provincias];
    }
    this.paginaActual = 1;
  }

  /**
   * Editar provincia
   */
  editarProvincia(provincia: Provincia): void {
    this.modoEdicion = true;
    this.provinciaEditando = provincia;
    this.formularioVisible = true;
    
    const regionId = provincia.regiones?.id || 0;
    
    this.provinciaForm.patchValue({
      nombre: provincia.nombre,
      regionId: regionId
    });
    
    this.provinciaForm.markAsPristine();
    Object.keys(this.provinciaForm.controls).forEach(key => {
      this.provinciaForm.get(key)?.markAsUntouched();
    });
  }

  /**
   * Guardar provincia
   */
  guardarProvincia(): void {
    if (this.provinciaForm.invalid) {
      Object.keys(this.provinciaForm.controls).forEach(key => {
        const control = this.provinciaForm.get(key);
        control?.markAsTouched();
      });
      this.mostrarMensajeError('Complete todos los campos obligatorios');
      return;
    }

    this.guardando = true;
    const { nombre, regionId } = this.provinciaForm.value;

    if (this.modoEdicion && this.provinciaEditando && this.provinciaEditando.id) {
      this.provinciaService.actualizarProvincia(
        this.provinciaEditando.id, 
        nombre, 
        regionId
      ).subscribe({
        next: (provinciaActualizada: Provincia) => {
          const index = this.provincias.findIndex(p => p.id === provinciaActualizada.id);
          if (index !== -1) {
            this.provincias[index] = provinciaActualizada;
          }
          this.provinciasFiltradas = [...this.provincias];
          this.totalProvincias = this.provincias.length;
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarMensajeExito('Provincia actualizada exitosamente');
        },
        error: (error: Error) => {
          console.error('Error al actualizar provincia:', error);
          this.guardando = false;
          this.mostrarMensajeError(error.message || 'Error al actualizar la provincia');
        }
      });
    } else {
      this.provinciaService.crearProvincia(nombre, regionId).subscribe({
        next: (nuevaProvincia: Provincia) => {
          this.provincias.unshift(nuevaProvincia);
          this.totalProvincias = this.provincias.length;
          this.provinciasFiltradas = [...this.provincias];
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarMensajeExito('Provincia creada exitosamente');
        },
        error: (error: Error) => {
          console.error('Error al crear provincia:', error);
          this.guardando = false;
          this.mostrarMensajeError(error.message || 'Error al crear la provincia');
        }
      });
    }
  }

  /**
   * Ver detalles
   */
  verDetalles(provincia: Provincia): void {
    const detalles = `📍 PROVINCIA: ${provincia.nombre}\n\n🗺️ Región: ${this.obtenerNombreRegion(provincia)}\n\n📅 ID: ${provincia.id || 'Nuevo'}`;
    alert(detalles);
  }

  /**
   * Eliminar provincia
   */
  eliminarProvincia(provincia: Provincia): void {
    this.provinciaAEliminar = provincia;
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Confirmar eliminación
   */
  confirmarEliminar(): void {
    if (this.provinciaAEliminar && this.provinciaAEliminar.id) {
      this.provinciaService.eliminarProvincia(this.provinciaAEliminar.id).subscribe({
        next: () => {
          const index = this.provincias.findIndex(p => p.id === this.provinciaAEliminar!.id);
          if (index !== -1) {
            this.provincias.splice(index, 1);
            this.totalProvincias = this.provincias.length;
            this.provinciasFiltradas = [...this.provincias];
          }
          
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
          
          if (this.provinciaEditando?.id === this.provinciaAEliminar?.id) {
            this.cerrarFormulario();
          }
          
          this.mostrarMensajeExito('Provincia eliminada exitosamente');
        },
        error: (error: Error) => {
          console.error('Error al eliminar provincia:', error);
          this.mostrarMensajeError(error.message || 'Error al eliminar la provincia');
          
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        }
      });
    }
    this.provinciaAEliminar = null;
  }

  private mostrarMensajeExito(mensaje: string): void {
    alert('✅ ' + mensaje);
  }

  private mostrarMensajeError(mensaje: string): void {
    alert('❌ ' + mensaje);
  }
}