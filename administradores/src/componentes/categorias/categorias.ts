import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
export class Categorias implements OnInit, AfterViewInit {
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
  filtroTexto: string = '';
  
  // Estadísticas
  totalCategorias: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

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

  ngAfterViewInit(): void {
    this.initModales();
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

  // Cargar categorías
  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.getAll().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
        this.categoriasFiltradas = [...categorias];
        this.totalCategorias = categorias.length;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.cargando = false;
      }
    });
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.categoriaEditando = null;
    this.categoriaForm.reset({
      nombre: '',
      descripcion: '',
      numeroEstrellas: 0
    });
    this.categoriaForm.markAsPristine();
    this.categoriaForm.markAsUntouched();
  }

  // Guardar categoría
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
        this.nuevoRegistro();
      },
      error: (error: any) => {
        console.error('Error guardando categoría:', error);
        this.guardando = false;
      }
    });
  }

  // Editar categoría
  editarCategoria(categoria: Categoria): void {
    this.modoEdicion = true;
    this.categoriaEditando = categoria;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      numeroEstrellas: categoria.numeroEstrellas || 0
    });
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.nuevoRegistro();
  }

  // Ver detalles
  verDetalles(categoria: Categoria): void {
    this.categoriaDetalles = categoria;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar categoría
  eliminarCategoria(categoria: Categoria): void {
    this.categoriaAEliminar = categoria;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.categoriaAEliminar?.id) return;
    
    this.categoriaService.delete(this.categoriaAEliminar.id).subscribe({
      next: () => {
        this.cargarCategorias();
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.categoriaAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando categoría:', error);
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
      }
    });
  }

  // Filtrar categorías
  filtrarCategorias(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  // Aplicar filtros
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

  // Obtener clase para estrellas
  getEstrellasClass(numeroEstrellas: number): string {
    if (numeroEstrellas >= 4) return 'badge text-bg-success';
    if (numeroEstrellas >= 3) return 'badge text-bg-primary';
    if (numeroEstrellas >= 2) return 'badge text-bg-warning';
    if (numeroEstrellas >= 1) return 'badge text-bg-secondary';
    return 'badge text-bg-light text-dark';
  }

  // Mostrar notificación
  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    const toastId = 'notification-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-bg-${tipo === 'error' ? 'danger' : tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const iconos = {
      success: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      error: 'bi-x-circle-fill'
    };
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${iconos[tipo]} me-2"></i>
          <strong>${titulo}</strong><br>
          <small>${mensaje}</small>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    const container = document.querySelector('.toast-container') || (() => {
      const newContainer = document.createElement('div');
      newContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      newContainer.style.zIndex = '1055';
      document.body.appendChild(newContainer);
      return newContainer;
    })();
    
    container.appendChild(toast);
    const bsToast = new (window as any).bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  }
}