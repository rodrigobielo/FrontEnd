// src/app/componentes/categorias/categorias.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CategoriaService } from '../../servicios/categoria.service';
import { Categoria, CategoriaDTO } from '../../modelos/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class Categorias implements OnInit, OnDestroy {
  categoriaForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  categoriaEditando: Categoria | null = null;
  categoriaDetalles: Categoria | null = null;
  categoriaAEliminar: Categoria | null = null;
  
  totalCategorias: number = 0;
  opcionesEstrellas = [1, 2, 3, 4, 5];

  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private router: Router // Inyectar Router para redirecciones
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
      ]],
      numeroEstrellas: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }

  ngOnInit(): void {
    // Verificar autenticación
    this.verificarAutenticacion();
    
    // Cargar datos
    this.cargarCategorias();
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
  }

  private verificarAutenticacion(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn !== 'true' || !currentUser) {
      console.warn('Usuario no autenticado. Redirigiendo al dashboard...');
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Opcional: Puedes parsear y usar la información del usuario
    try {
      const user = JSON.parse(currentUser);
      console.log('Usuario autenticado:', user.name);
    } catch (error) {
      console.error('Error al parsear datos del usuario:', error);
    }
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

  cargarCategorias(): void {
    this.cargando = true;
    
    this.categoriaService.getAll().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        this.categoriasFiltradas = [...this.categorias];
        this.totalCategorias = this.categorias.length;
        this.cargando = false;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error: Error) => {
        console.error('Error al cargar categorías:', error);
        this.cargando = false;
        this.mostrarNotificacion('error', 'Error', error.message || 'No se pudieron cargar las categorías');
        this.categorias = [];
        this.categoriasFiltradas = [];
        this.totalCategorias = 0;
      }
    });
  }

  filtrarCategorias(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    this.aplicarFiltros(filtro);
  }

  filtrarPorEstrellas(numeroEstrellas: number): void {
    this.aplicarFiltrosPorEstrellas(numeroEstrellas);
  }

  // Métodos públicos para usar en la plantilla
  aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.categorias];
    
    if (filtroTexto) {
      resultado = resultado.filter(categoria =>
        categoria.nombre.toLowerCase().includes(filtroTexto) ||
        categoria.descripcion.toLowerCase().includes(filtroTexto) ||
        categoria.numeroEstrellas.toString().includes(filtroTexto)
      );
    }
    
    this.categoriasFiltradas = resultado;
  }

  aplicarFiltrosPorEstrellas(numeroEstrellas: number): void {
    let resultado = [...this.categorias];
    
    if (numeroEstrellas > 0) {
      resultado = resultado.filter(c => c.numeroEstrellas === numeroEstrellas);
    }
    
    this.categoriasFiltradas = resultado;
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.categoriaEditando = null;
    
    this.categoriaForm.reset({
      nombre: '',
      numeroEstrellas: 1,
      descripcion: ''
    });
    this.categoriaForm.markAsPristine();
    this.categoriaForm.markAsUntouched();
  }

  editarCategoria(categoria: Categoria): void {
    this.modoEdicion = true;
    this.categoriaEditando = categoria;
    
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      numeroEstrellas: categoria.numeroEstrellas,
      descripcion: categoria.descripcion
    });
    
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  guardarCategoria(): void {
    Object.keys(this.categoriaForm.controls).forEach(key => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });

    if (this.categoriaForm.invalid) {
      for (const key of Object.keys(this.categoriaForm.controls)) {
        const control = this.categoriaForm.get(key);
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
    
    const categoriaData: CategoriaDTO = this.categoriaForm.value;
    
    if (this.modoEdicion && this.categoriaEditando) {
      this.categoriaService.update(this.categoriaEditando.id, categoriaData).subscribe({
        next: (categoriaActualizada: Categoria) => {
          const index = this.categorias.findIndex(c => c.id === categoriaActualizada.id);
          if (index !== -1) {
            this.categorias[index] = categoriaActualizada;
          }
          this.aplicarFiltros('');
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Categoría actualizada',
            `La categoría "${categoriaData.nombre}" se ha actualizado correctamente.`
          );
        },
        error: (error: Error) => {
          console.error('Error al actualizar categoría:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            error.message || 'No se pudo actualizar la categoría. Por favor, intente nuevamente.'
          );
        }
      });
    } else {
      this.categoriaService.create(categoriaData).subscribe({
        next: (nuevaCategoria: Categoria) => {
          this.categorias.unshift(nuevaCategoria);
          this.totalCategorias = this.categorias.length;
          this.aplicarFiltros('');
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Categoría creada',
            `La categoría "${categoriaData.nombre}" se ha creado correctamente.`
          );
        },
        error: (error: Error) => {
          console.error('Error al crear categoría:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            error.message || 'No se pudo crear la categoría. Por favor, intente nuevamente.'
          );
        }
      });
    }
  }

  cancelarEdicion(): void {
    if (this.categoriaForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

  verDetalles(categoria: Categoria): void {
    this.categoriaDetalles = categoria;
    
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    this.categoriaAEliminar = categoria;
    
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  confirmarEliminar(): void {
    if (!this.categoriaAEliminar) return;
    
    const categoriaAEliminar = this.categoriaAEliminar;
    this.categoriaService.delete(categoriaAEliminar.id).subscribe({
      next: () => {
        const index = this.categorias.findIndex(c => c.id === categoriaAEliminar.id);
        if (index !== -1) {
          const nombreEliminado = categoriaAEliminar.nombre;
          this.categorias.splice(index, 1);
          this.totalCategorias = this.categorias.length;
          this.aplicarFiltros('');
          
          if (this.confirmarModalInstance) {
            this.confirmarModalInstance.hide();
          }
          
          this.mostrarNotificacion('info', 
            'Categoría eliminada',
            `La categoría "${nombreEliminado}" ha sido eliminada correctamente.`
          );
        }
        this.categoriaAEliminar = null;
      },
      error: (error: Error) => {
        console.error('Error al eliminar categoría:', error);
        this.mostrarNotificacion('error', 
          'Error',
          error.message || 'No se pudo eliminar la categoría. Por favor, intente nuevamente.'
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
    const control = this.categoriaForm.get(fieldName);
    
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
    
    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    }
    
    if (errors['pattern']) {
      if (fieldName === 'nombre') {
        return 'Solo letras, espacios, puntos y guiones';
      }
      return 'Formato inválido';
    }
    
    return 'Valor inválido';
  }

  getEstrellasTexto(numeroEstrellas: number): string {
    switch(numeroEstrellas) {
      case 1: return '★ (Económica)';
      case 2: return '★★ (Básica)';
      case 3: return '★★★ (Estándar)';
      case 4: return '★★★★ (Superior)';
      case 5: return '★★★★★ (Lujo)';
      default: return `${numeroEstrellas} estrellas`;
    }
  }
}