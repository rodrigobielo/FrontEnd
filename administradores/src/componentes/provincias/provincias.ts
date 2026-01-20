import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProvinciaService } from '../../servicios/provincia.service';
import { RegionService } from '../../servicios/region.service';
import { Region } from '../../modelos/region.model';
import { Provincia } from '../../modelos/provincia.model';

@Component({
  selector: 'app-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './provincias.html',
  styleUrls: ['./provincias.css']
})
export class Provincias implements OnInit, OnDestroy {
  provinciaForm: FormGroup;
  
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoRegiones: boolean = false;
  filtroRegion: number = 0;
  
  regiones: Region[] = [];
  provincias: Provincia[] = [];
  provinciasFiltradas: Provincia[] = [];
  provinciaEditando: Provincia | null = null;
  provinciaAEliminar: Provincia | null = null;
  
  totalProvincias: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private provinciaService: ProvinciaService,
    private regionService: RegionService
  ) {
    this.provinciaForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100)
      ]],
      regionId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      if (url.length > 0 && url[0].path === 'nuevo') {
        this.nuevoRegistro();
      }
    });
    
    this.cargarRegiones();
    this.cargarProvincias();
  }

  ngOnDestroy(): void {}

  cargarRegiones(): void {
    this.cargandoRegiones = true;
    this.regionService.obtenerRegiones().subscribe({
      next: (regiones: Region[]) => {
        this.regiones = regiones;
        this.cargandoRegiones = false;
      },
      error: (error) => {
        console.error('Error al cargar regiones:', error);
        this.cargandoRegiones = false;
        this.mostrarMensajeError('No se pudieron cargar las regiones');
      }
    });
  }

  cargarProvincias(): void {
    this.cargando = true;
    this.provinciaService.obtenerProvincias().subscribe({
      next: (provincias: Provincia[]) => {
        this.provincias = provincias;
        this.provinciasFiltradas = [...provincias];
        this.totalProvincias = provincias.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar provincias:', error);
        this.cargando = false;
        this.mostrarMensajeError('No se pudieron cargar las provincias');
      }
    });
  }

  // Método para obtener el nombre de la región desde un objeto Provincia
  obtenerNombreRegion(provincia: Provincia): string {
    if (!provincia.regiones?.id) {
      return 'Sin región asignada';
    }
    
    const region = this.regiones.find(r => r.id === provincia.regiones!.id);
    return region ? region.nombre : `Región ${provincia.regiones.id}`;
  }

  // Método para obtener el nombre de la región por su ID (para filtros)
  obtenerNombreRegionPorId(regionId: number): string {
    if (!regionId) return 'Todas las regiones';
    const region = this.regiones.find(r => r.id === regionId);
    return region ? region.nombre : `Región ${regionId}`;
  }

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
  }

  filtrarPorRegion(regionId: number): void {
    this.filtroRegion = regionId;
    if (regionId > 0) {
      this.provinciasFiltradas = this.provincias.filter(provincia =>
        provincia.regiones?.id === regionId
      );
    } else {
      this.provinciasFiltradas = [...this.provincias];
    }
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.provinciaEditando = null;
    this.provinciaForm.reset({
      nombre: '',
      regionId: ''
    });
    this.provinciaForm.markAsPristine();
    this.provinciaForm.markAsUntouched();
  }

  editarProvincia(provincia: Provincia): void {
    this.modoEdicion = true;
    this.provinciaEditando = provincia;
    
    const regionId = provincia.regiones?.id || 0;
    
    this.provinciaForm.patchValue({
      nombre: provincia.nombre,
      regionId: regionId
    });
    
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  guardarProvincia(): void {
    if (this.provinciaForm.invalid) {
      Object.keys(this.provinciaForm.controls).forEach(key => {
        const control = this.provinciaForm.get(key);
        control?.markAsTouched();
      });
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
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarMensajeExito('Provincia actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar provincia:', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al actualizar la provincia: ' + error.message);
        }
      });
    } else {
      this.provinciaService.crearProvincia(nombre, regionId).subscribe({
        next: (nuevaProvincia: Provincia) => {
          this.provincias.unshift(nuevaProvincia);
          this.totalProvincias = this.provincias.length;
          this.provinciasFiltradas = [...this.provincias];
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarMensajeExito('Provincia creada exitosamente');
        },
        error: (error) => {
          console.error('Error al crear provincia:', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al crear la provincia: ' + error.message);
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.nuevoRegistro();
  }

  verDetalles(provincia: Provincia): void {
    const detalles = `
      Provincia: ${provincia.nombre}
      Región: ${this.obtenerNombreRegion(provincia)}
      ID: ${provincia.id || 'Nuevo'}
    `;
    
    alert(detalles);
  }

  eliminarProvincia(provincia: Provincia): void {
    this.provinciaAEliminar = provincia;
    
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

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
            modal.hide();
          }
          
          this.mostrarMensajeExito('Provincia eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar provincia:', error);
          this.mostrarMensajeError('Error al eliminar la provincia: ' + error.message);
          
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal.hide();
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