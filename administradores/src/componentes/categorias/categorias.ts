import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CategoriaService } from '../../servicios/categoria.service';
import { Categoria, CategoriaDTO } from '../../modelos/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class Categorias implements OnInit {
  // Datos
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  categoriaEditando: Categoria | null = null;
  categoriaDetalles: Categoria | null = null;
  categoriaAEliminar: Categoria | null = null;
  
  // Formulario
  categoriaForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  formularioVisible: boolean = false;
  filtroTexto: string = '';
  
  // Estadísticas
  totalCategorias: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(500)]],
      numeroEstrellas: [0, [Validators.min(0), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  /**
   * Mostrar formulario
   */
  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.modoEdicion = false;
    this.categoriaEditando = null;
    this.categoriaForm.reset({
      nombre: '',
      descripcion: '',
      numeroEstrellas: 0
    });
    this.categoriaForm.markAsPristine();
    this.categoriaForm.markAsUntouched();
    
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
    this.categoriaEditando = null;
    this.categoriaForm.reset();
  }

  /**
   * Cargar categorías
   */
  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.getAll().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
        this.categoriasFiltradas = [...categorias];
        this.totalCategorias = categorias.length;
        this.cargando = false;
        this.paginaActual = 1;
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.cargando = false;
      }
    });
  }

  /**
   * Guardar categoría
   */
  guardarCategoria(): void {
    Object.keys(this.categoriaForm.controls).forEach(key => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });

    if (this.categoriaForm.invalid) {
      return;
    }

    this.guardando = true;
    const categoriaData: CategoriaDTO = {
      nombre: this.categoriaForm.get('nombre')?.value,
      descripcion: this.categoriaForm.get('descripcion')?.value || '',
      numeroEstrellas: this.categoriaForm.get('numeroEstrellas')?.value || 0
    };

    const guardarObservable = this.modoEdicion && this.categoriaEditando?.id
      ? this.categoriaService.update(this.categoriaEditando.id, categoriaData)
      : this.categoriaService.create(categoriaData);

    guardarObservable.subscribe({
      next: () => {
        this.cargarCategorias();
        this.guardando = false;
        this.cerrarFormulario();
      },
      error: (error: any) => {
        console.error('Error guardando categoría:', error);
        this.guardando = false;
      }
    });
  }

  /**
   * Editar categoría
   */
  editarCategoria(categoria: Categoria): void {
    this.modoEdicion = true;
    this.categoriaEditando = categoria;
    this.formularioVisible = true;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      numeroEstrellas: categoria.numeroEstrellas || 0
    });
    
    setTimeout(() => {
      const formulario = document.querySelector('.modern-form');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Cancelar edición
   */
  cancelarEdicion(): void {
    this.cerrarFormulario();
  }

  /**
   * Ver detalles
   */
  verDetalles(categoria: Categoria): void {
    this.categoriaDetalles = categoria;
    const modalElement = document.getElementById('detallesModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Eliminar categoría
   */
  eliminarCategoria(categoria: Categoria): void {
    this.categoriaAEliminar = categoria;
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
    if (!this.categoriaAEliminar?.id) return;
    
    this.categoriaService.delete(this.categoriaAEliminar.id).subscribe({
      next: () => {
        this.cargarCategorias();
        const modalElement = document.getElementById('confirmarEliminarModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
        this.categoriaAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando categoría:', error);
        const modalElement = document.getElementById('confirmarEliminarModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      }
    });
  }

  /**
   * Filtrar categorías
   */
  filtrarCategorias(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
    this.paginaActual = 1;
  }

  /**
   * Aplicar filtros
   */
  private aplicarFiltros(): void {
    let resultado = [...this.categorias];
    
    if (this.filtroTexto) {
      resultado = resultado.filter(categoria =>
        categoria.nombre.toLowerCase().includes(this.filtroTexto) ||
        (categoria.descripcion || '').toLowerCase().includes(this.filtroTexto) ||
        ((categoria.numeroEstrellas || 0).toString()).includes(this.filtroTexto)
      );
    }
    
    this.categoriasFiltradas = resultado;
  }

  /**
   * Obtener clase para estrellas
   */
  getEstrellasClass(numeroEstrellas: number): string {
    if (numeroEstrellas >= 4) return 'badge bg-success';
    if (numeroEstrellas >= 3) return 'badge bg-primary';
    if (numeroEstrellas >= 2) return 'badge bg-warning text-dark';
    if (numeroEstrellas >= 1) return 'badge bg-secondary';
    return 'badge bg-light text-dark';
  }
}