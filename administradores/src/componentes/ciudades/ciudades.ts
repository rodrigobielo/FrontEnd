import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProvinciaService } from '../../servicios/provincia.service';
import { CiudadService } from '../../servicios/ciudades.service';
import { ProvinciaSimple } from '../../modelos/provincia.model';
import { Ciudad, CiudadDTO } from '../../modelos/ciudad.model';

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css']
})
export class Ciudades implements OnInit, OnDestroy {
  ciudadForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoProvincias: boolean = false;
  filtroProvincia: number = 0;
  
  provincias: ProvinciaSimple[] = [];
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  ciudadEditando: Ciudad | null = null;
  ciudadDetalles: Ciudad | null = null;
  ciudadAEliminar: Ciudad | null = null;
  
  totalCiudades: number = 0;

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
      provinciaId: ['', [Validators.required, Validators.min(1)]]
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

  cargarProvincias(): void {
    this.cargandoProvincias = true;
    this.provinciaService.getAll().subscribe({
      next: (data: ProvinciaSimple[]) => {
        this.provincias = data;
        this.cargandoProvincias = false;
        console.log('Provincias cargadas:', this.provincias);
        
        // Si hay provincias, seleccionar la primera por defecto en nuevo registro
        if (!this.modoEdicion && this.provincias.length > 0) {
          this.ciudadForm.patchValue({
            provinciaId: this.provincias[0].id
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar provincias:', error);
        this.cargandoProvincias = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las provincias desde el backend');
        
        // Datos de ejemplo como fallback
        this.provincias = [
          { id: 1, nombre: 'Litoral' },
          { id: 2, nombre: 'Centro' },
          { id: 3, nombre: 'Norte' }
        ];
      }
    });
  }

  cargarCiudades(): void {
    this.cargando = true;
    
    this.ciudadService.getAll().subscribe({
      next: (data: Ciudad[]) => {
        this.ciudades = data;
        this.ciudadesFiltradas = [...this.ciudades];
        this.totalCiudades = this.ciudades.length;
        this.cargando = false;
        console.log('Ciudades cargadas:', this.ciudades);
      },
      error: (error: any) => {
        console.error('Error al cargar ciudades:', error);
        this.cargando = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las ciudades');
        this.ciudades = [];
        this.ciudadesFiltradas = [];
        this.totalCiudades = 0;
      }
    });
  }

  obtenerNombreProvincia(provinciaId: number): string {
    if (!provinciaId) return 'Sin provincia';
    const provincia = this.provincias.find(p => p.id === provinciaId);
    return provincia ? provincia.nombre : `Provincia ${provinciaId}`;
  }

  filtrarCiudades(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    this.aplicarFiltros(filtro);
  }

  filtrarPorProvincia(provinciaId: number): void {
    this.filtroProvincia = provinciaId;
    this.aplicarFiltros('');
  }

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
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.ciudadEditando = null;
    
    // Si hay provincias, seleccionar la primera por defecto
    const provinciaDefault = this.provincias.length > 0 ? this.provincias[0].id : '';
    
    this.ciudadForm.reset({
      nombre: '',
      descripcion: '',
      provinciaId: provinciaDefault
    });
    this.ciudadForm.markAsPristine();
    this.ciudadForm.markAsUntouched();
  }

  editarCiudad(ciudad: Ciudad): void {
    this.modoEdicion = true;
    this.ciudadEditando = ciudad;
    
    this.ciudadForm.patchValue({
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provinciaId: ciudad.provinciaId
    });
    
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  guardarCiudad(): void {
    // Marcar todos los controles como touched
    Object.keys(this.ciudadForm.controls).forEach(key => {
      const control = this.ciudadForm.get(key);
      control?.markAsTouched();
    });

    if (this.ciudadForm.invalid) {
      // Encontrar el primer campo inválido y enfocarlo
      for (const key of Object.keys(this.ciudadForm.controls)) {
        const control = this.ciudadForm.get(key);
        if (control?.invalid) {
          const element = document.getElementById(key);
          if (element) {
            element.focus();
          }
          break;
        }
      }
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
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Ciudad actualizada',
            `La ciudad "${ciudadData.nombre}" se ha actualizado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error al actualizar ciudad:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            'No se pudo actualizar la ciudad. Por favor, intente nuevamente.'
          );
        }
      });
    } else {
      this.ciudadService.create(ciudadData).subscribe({
        next: (nuevaCiudad: Ciudad) => {
          this.ciudades.unshift(nuevaCiudad);
          this.totalCiudades = this.ciudades.length;
          this.aplicarFiltros('');
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Ciudad creada',
            `La ciudad "${ciudadData.nombre}" se ha creado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error al crear ciudad:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            'No se pudo crear la ciudad. Por favor, intente nuevamente.'
          );
        }
      });
    }
  }

  cancelarEdicion(): void {
    if (this.ciudadForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

  verDetalles(ciudad: Ciudad): void {
    this.ciudadDetalles = ciudad;
    
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  eliminarCiudad(ciudad: Ciudad): void {
    this.ciudadAEliminar = ciudad;
    
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  confirmarEliminar(): void {
    if (!this.ciudadAEliminar) return;
    
    const ciudadAEliminar = this.ciudadAEliminar;
    this.ciudadService.delete(ciudadAEliminar.id).subscribe({
      next: () => {
        const index = this.ciudades.findIndex(c => c.id === ciudadAEliminar.id);
        if (index !== -1) {
          const nombreEliminado = ciudadAEliminar.nombre;
          this.ciudades.splice(index, 1);
          this.totalCiudades = this.ciudades.length;
          this.aplicarFiltros('');
          
          if (this.confirmarModalInstance) {
            this.confirmarModalInstance.hide();
          }
          
          this.mostrarNotificacion('info', 
            'Ciudad eliminada',
            `La ciudad "${nombreEliminado}" ha sido eliminada correctamente.`
          );
        }
        this.ciudadAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error al eliminar ciudad:', error);
        this.mostrarNotificacion('error', 
          'Error',
          'No se pudo eliminar la ciudad. Por favor, intente nuevamente.'
        );
      }
    });
  }

  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    const iconos = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    
    alert(`${iconos[tipo]} ${titulo}\n\n${mensaje}`);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.ciudadForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) return '';
    
    const errors = control.errors;
    
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['pattern']) {
      if (fieldName === 'nombre') {
        return 'Solo letras, espacios, puntos y guiones';
      }
      return 'Formato inválido';
    }
    
    return 'Valor inválido';
  }
}