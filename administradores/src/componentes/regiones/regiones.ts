import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Region } from '../../modelos/region.model';
import { RegionService } from '../../servicios/region.service';

@Component({
  selector: 'app-regiones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './regiones.html',
  styleUrls: ['./regiones.css']
})
export class Regiones implements OnInit, OnDestroy {
  regionForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  regiones: Region[] = [];
  regionesFiltradas: Region[] = [];
  regionEditando: Region | null = null;
  regionAEliminar: Region | null = null;
  totalRegiones: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private regionService: RegionService
  ) {
    this.regionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      codigo: ['']
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      if (url.length > 0 && url[0].path === 'nuevo') {
        this.nuevoRegistro();
      }
    });
    this.cargarRegiones();
  }

  ngOnDestroy(): void {
    // Código de limpieza si es necesario
  }

  cargarRegiones(): void {
    this.cargando = true;
    this.regionService.obtenerRegiones().subscribe({
      next: (regiones) => {
        this.regiones = regiones;
        this.regionesFiltradas = [...this.regiones];
        this.totalRegiones = this.regiones.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar regiones', error);
        this.cargando = false;
      }
    });
  }

  filtrarRegiones(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase();
    if (filtro) {
      this.regionesFiltradas = this.regiones.filter(region =>
        region.nombre.toLowerCase().includes(filtro) ||
        region.descripcion.toLowerCase().includes(filtro) ||
        (region.codigo && region.codigo.toLowerCase().includes(filtro))
      );
    } else {
      this.regionesFiltradas = [...this.regiones];
    }
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.regionEditando = null;
    this.regionForm.reset();
    this.regionForm.markAsPristine();
    this.regionForm.markAsUntouched();
  }

  editarRegion(region: Region): void {
    this.modoEdicion = true;
    this.regionEditando = region;
    this.regionForm.patchValue({
      nombre: region.nombre,
      descripcion: region.descripcion,
      codigo: region.codigo || ''
    });
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  guardarRegion(): void {
    if (this.regionForm.invalid) {
      Object.keys(this.regionForm.controls).forEach(key => {
        const control = this.regionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    const regionData = this.regionForm.value;

    if (this.modoEdicion && this.regionEditando) {
      // CORRECCIÓN: Verificar que regionEditando.id existe
      if (!this.regionEditando.id) {
        console.error('No se puede actualizar: ID no definido');
        this.guardando = false;
        this.mostrarMensajeError('Error: No se pudo identificar la región a actualizar');
        return;
      }

      // Actualizar región
      this.regionService.actualizarRegion(this.regionEditando.id, regionData).subscribe({
        next: (regionActualizada) => {
          const index = this.regiones.findIndex(r => r.id === regionActualizada.id);
          if (index !== -1) {
            this.regiones[index] = regionActualizada;
          }
          this.regionesFiltradas = [...this.regiones];
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarMensajeExito('Región actualizada exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar región', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al actualizar la región');
        }
      });
    } else {
      // Crear región - el backend asignará el ID
      this.regionService.crearRegion(regionData).subscribe({
        next: (nuevaRegion) => {
          this.regiones.unshift(nuevaRegion);
          this.totalRegiones = this.regiones.length;
          this.regionesFiltradas = [...this.regiones];
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarMensajeExito('Región creada exitosamente');
        },
        error: (error) => {
          console.error('Error al crear región', error);
          this.guardando = false;
          this.mostrarMensajeError('Error al crear la región');
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.nuevoRegistro();
  }

  verDetalles(region: Region): void {
    console.log('Ver detalles:', region);
    alert(`Nombre: ${region.nombre}\nDescripción: ${region.descripcion}`);
  }

  eliminarRegion(region: Region): void {
    this.regionAEliminar = region;
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmarEliminar(): void {
    // CORRECCIÓN: Verificar que regionAEliminar y su id existen
    if (this.regionAEliminar && this.regionAEliminar.id) {
      this.regionService.eliminarRegion(this.regionAEliminar.id).subscribe({
        next: () => {
          const index = this.regiones.findIndex(r => r.id === this.regionAEliminar!.id);
          if (index !== -1) {
            this.regiones.splice(index, 1);
            this.regionesFiltradas = [...this.regiones];
            this.totalRegiones = this.regiones.length;
          }
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal.hide();
          }
          this.mostrarMensajeExito('Región eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar región', error);
          this.mostrarMensajeError('Error al eliminar la región');
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal.hide();
          }
        }
      });
    } else {
      console.error('No se puede eliminar: región o ID no definido');
      this.mostrarMensajeError('Error: No se pudo identificar la región a eliminar');
      
      // Cerrar modal si está abierto
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal.hide();
      }
    }
    this.regionAEliminar = null;
  }

  private mostrarMensajeExito(mensaje: string): void {
    // Implementar con toast o sweetalert2
    alert(mensaje);
  }

  private mostrarMensajeError(mensaje: string): void {
    alert(mensaje);
  }
}