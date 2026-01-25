import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { HotelService } from '../../servicios/hotel.service';
import { CiudadService } from '../../servicios/ciudades.service';
import { CategoriaService } from '../../servicios/categoria.service';
import { UsuarioService } from '../../servicios/usuario.service';

// Modelos
import { Ciudad } from '../../modelos/ciudad.model';
import { Categoria } from '../../modelos/categoria.model';
import { Usuario } from '../../modelos/usuario.model';
import { Hotel } from '../../modelos/hotel.model';

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './hoteles.html',
  styleUrls: ['./hoteles.css']
})
export class Hoteles implements OnInit, OnDestroy, AfterViewInit {
  // Inyección de servicios
  private hotelService = inject(HotelService);
  private ciudadService = inject(CiudadService);
  private categoriaService = inject(CategoriaService);
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);
  
  // Formulario
  hotelForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoCiudades: boolean = false;
  cargandoCategorias: boolean = false;
  cargandoAdministradores: boolean = false;
  filtroCategoria: number | null = null;
  filtroTexto: string = '';
  
  // Datos - inicialización segura
  ciudades: Ciudad[] = [];
  categorias: Categoria[] = [];
  administradores: Usuario[] = []; // Usuarios con rol de administrador
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  // Estadísticas
  totalHoteles: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor() {
    // Formulario de hotel con valores por defecto
    this.hotelForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      contactos: ['', [
        Validators.required, 
        Validators.minLength(10)
      ]],
      precio: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      ciudadId: ['', [Validators.required]],
      categoriaId: ['', [Validators.required]],
      administradorId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarCategorias();
    this.cargarAdministradores();
    this.cargarHoteles();
  }

  ngAfterViewInit(): void {
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
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

  // Cargar ciudades dinámicamente desde la base de datos
  cargarCiudades(): void {
    this.cargandoCiudades = true;
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades: Ciudad[]) => {
        this.ciudades = ciudades || [];
        this.cargandoCiudades = false;
        console.log('Ciudades cargadas desde BD:', this.ciudades);
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las ciudades desde la base de datos');
        this.cargandoCiudades = false;
        this.ciudades = [];
      }
    });
  }

  // Cargar categorías dinámicamente desde la base de datos
  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias || [];
        this.cargandoCategorias = false;
        console.log('Categorías cargadas desde BD:', this.categorias);
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las categorías desde la base de datos');
        this.cargandoCategorias = false;
        this.categorias = [];
      }
    });
  }

  // Cargar administradores (usuarios con rol de administrador) - CORREGIDO
  cargarAdministradores(): void {
    this.cargandoAdministradores = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        // Filtrar solo administradores - usar roles?.nombre
        this.administradores = (usuarios || []).filter((usuario: Usuario) => 
          usuario.roles?.nombre?.toLowerCase().includes('admin') || 
          usuario.roles?.nombre?.toLowerCase().includes('administrador')
        );
        this.cargandoAdministradores = false;
        console.log('Administradores cargados:', this.administradores);
      },
      error: (error: any) => {
        console.error('Error cargando administradores:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los administradores');
        this.cargandoAdministradores = false;
        this.administradores = [];
      }
    });
  }

  // Cargar hoteles
  cargarHoteles(): void {
    this.cargando = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.hotelesFiltrados = [...this.hoteles];
        this.totalHoteles = this.hoteles.length;
        this.cargando = false;
        console.log('Hoteles cargados:', this.hoteles);
      },
      error: (error: any) => {
        console.error('Error cargando hoteles:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los hoteles');
        this.cargando = false;
        this.hoteles = [];
        this.hotelesFiltrados = [];
      }
    });
  }

  // Obtener clase para badge de categoría
  getCategoriaBadgeClass(categoriaId?: number): string {
    if (!categoriaId) return 'badge text-bg-secondary';
    
    const categoria = this.categorias.find(c => c.id === categoriaId);
    if (!categoria) return 'badge text-bg-secondary';

    // Si tiene numeroEstrellas, usamos ese para asignar clase
    if (categoria.numeroEstrellas !== undefined && categoria.numeroEstrellas !== null) {
      switch (categoria.numeroEstrellas) {
        case 1: return 'badge text-bg-secondary';
        case 2: return 'badge text-bg-primary';
        case 3: return 'badge text-bg-info';
        case 4: return 'badge text-bg-success';
        case 5: return 'badge text-bg-warning';
        default: return 'badge text-bg-secondary';
      }
    }

    // Si no tiene numeroEstrellas, usamos el nombre para inferir
    const nombreCategoria = categoria.nombre.toLowerCase();
    
    if (nombreCategoria.includes('boutique')) {
      return 'badge text-bg-purple';
    } else if (nombreCategoria.includes('apart') || nombreCategoria.includes('apart hotel')) {
      return 'badge text-bg-info';
    } else if (nombreCategoria.includes('hostel')) {
      return 'badge text-bg-light text-dark';
    } else if (nombreCategoria.includes('económico') || nombreCategoria.includes('economico')) {
      return 'badge text-bg-secondary';
    } else if (nombreCategoria.includes('lujo')) {
      return 'badge text-bg-warning';
    } else {
      return 'badge text-bg-secondary';
    }
  }

  // Filtrar hoteles
  filtrarHoteles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  filtrarPorCategoria(categoriaId: number): void {
    this.filtroCategoria = categoriaId === 0 ? null : categoriaId;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.hoteles];
    
    if (this.filtroCategoria) {
      resultado = resultado.filter(h => h.categorias?.id === this.filtroCategoria);
    }
    
    if (this.filtroTexto) {
      resultado = resultado.filter(hotel =>
        hotel.nombre.toLowerCase().includes(this.filtroTexto) ||
        hotel.descripcion.toLowerCase().includes(this.filtroTexto) ||
        hotel.contactos.toLowerCase().includes(this.filtroTexto) ||
        hotel.ciudades?.nombre.toLowerCase().includes(this.filtroTexto) ||
        hotel.categorias?.nombre.toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.hotelesFiltrados = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.hotelEditando = null;
    
    this.hotelForm.reset({
      nombre: '',
      descripcion: '',
      contactos: '',
      precio: 0,
      ciudadId: '',
      categoriaId: '',
      administradorId: ''
    });
    
    this.hotelForm.markAsPristine();
    this.hotelForm.markAsUntouched();
  }

  // Editar hotel
  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    
    this.hotelForm.patchValue({
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      precio: hotel.precio || 0,
      ciudadId: hotel.ciudades?.id || '',
      categoriaId: hotel.categorias?.id || '',
      administradorId: hotel.usuarios?.id || ''
    });
  }

  // Guardar hotel
  guardarHotel(): void {
    // Marcar todos los controles como tocados para mostrar errores
    Object.keys(this.hotelForm.controls).forEach(key => {
      const control = this.hotelForm.get(key);
      control?.markAsTouched();
    });

    if (this.hotelForm.invalid) {
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
      return;
    }

    // Verificar que haya datos disponibles
    if (this.categorias.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay categorías disponibles en la base de datos.'
      );
      return;
    }

    if (this.ciudades.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay ciudades disponibles en la base de datos.'
      );
      return;
    }

    if (this.administradores.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay administradores disponibles en la base de datos.'
      );
      return;
    }

    this.guardando = true;
    const hotelData = this.hotelForm.value;
    
    // Preparar objeto para enviar al backend según la entidad Java
    const hotelParaEnviar = {
      nombre: hotelData.nombre,
      descripcion: hotelData.descripcion,
      contactos: hotelData.contactos,
      precio: hotelData.precio,
      ciudades: { id: hotelData.ciudadId },
      categorias: { id: hotelData.categoriaId },
      usuarios: { id: hotelData.administradorId },
      habitaciones: []
    };

    // Usar aserción no nula para hotelEditando.id en modo edición
    if (this.modoEdicion && this.hotelEditando && this.hotelEditando.id !== undefined) {
      // Modo edición
      this.hotelService.updateHotel(this.hotelEditando.id!, hotelParaEnviar).subscribe({
        next: (hotelGuardado: Hotel) => {
          this.cargarHoteles();
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Hotel actualizado',
            `Hotel "${hotelData.nombre}" actualizado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error actualizando hotel:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo actualizar el hotel. Intenta nuevamente.'
          );
        }
      });
    } else {
      // Modo creación
      this.hotelService.createHotel(hotelParaEnviar).subscribe({
        next: (hotelGuardado: Hotel) => {
          this.cargarHoteles();
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Hotel creado',
            `Hotel "${hotelData.nombre}" creado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error creando hotel:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo crear el hotel. Intenta nuevamente.'
          );
        }
      });
    }
  }

  // Método para ver detalles de un hotel
  verDetalles(hotel: Hotel): void {
    this.hotelDetalles = hotel;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('detallesModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para preparar la eliminación de un hotel
  eliminarHotel(hotel: Hotel): void {
    this.hotelAEliminar = hotel;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para confirmar la eliminación
  confirmarEliminar(): void {
    if (!this.hotelAEliminar || this.hotelAEliminar.id === undefined) {
      this.mostrarNotificacion('error', 'Error', 'No se puede eliminar el hotel porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    // Usar aserción no nula para id
    this.hotelService.deleteHotel(this.hotelAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Hotel eliminado', 
          `El hotel "${this.hotelAEliminar!.nombre}" ha sido eliminado correctamente.`
        );
        this.cargarHoteles(); // Recargar la lista
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.hotelAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando hotel:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo eliminar el hotel. Intenta nuevamente.'
        );
      }
    });
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