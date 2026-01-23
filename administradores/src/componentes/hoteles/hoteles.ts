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
  
  // Formularios
  hotelForm: FormGroup;
  usuarioForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoCiudades: boolean = false;
  cargandoCategorias: boolean = false;
  guardandoUsuario: boolean = false;
  filtroCategoria: number | null = null;
  filtroTexto: string = '';
  
  // Datos
  ciudades: Ciudad[] = [];
  categorias: Categoria[] = [];
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  // Usuarios
  usuarios: Usuario[] = [];
  
  // Estadísticas
  totalHoteles: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor() {
    // Formulario de hotel
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
      contrasena: ['hotel123', [Validators.required]],
      ciudadId: [{value: '', disabled: false}, [Validators.required]],
      categoriaId: [{value: '', disabled: false}, [Validators.required]],
      habitaciones: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      precioPromedio: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]]
    });

    // Formulario de usuario
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-()]+$/)]],
      nacionalidad: ['', [Validators.required]],
      numPasaporte: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['usuario', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarCategorias();
    this.cargarHoteles();
    this.cargarUsuarios();
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
    // Deshabilitar el control mientras se cargan los datos
    this.hotelForm.get('ciudadId')?.disable();
    
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades: Ciudad[]) => {
        this.ciudades = ciudades;
        this.cargandoCiudades = false;
        
        // Habilitar el control si hay datos
        if (ciudades.length > 0) {
          this.hotelForm.get('ciudadId')?.enable();
        } else {
          // Mantener deshabilitado si no hay datos
          this.hotelForm.get('ciudadId')?.disable();
        }
        
        console.log('Ciudades cargadas desde BD:', ciudades);
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las ciudades desde la base de datos');
        this.cargandoCiudades = false;
        this.ciudades = [];
        // Habilitar el control pero mostrar mensaje de error
        this.hotelForm.get('ciudadId')?.enable();
      }
    });
  }

  // Cargar categorías dinámicamente desde la base de datos
  cargarCategorias(): void {
    this.cargandoCategorias = true;
    // Deshabilitar el control mientras se cargan los datos
    this.hotelForm.get('categoriaId')?.disable();
    
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
        this.cargandoCategorias = false;
        
        // Habilitar el control si hay datos
        if (categorias.length > 0) {
          this.hotelForm.get('categoriaId')?.enable();
        } else {
          // Mantener deshabilitado si no hay datos
          this.hotelForm.get('categoriaId')?.disable();
        }
        
        console.log('Categorías cargadas desde BD:', categorias);
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las categorías desde la base de datos');
        this.cargandoCategorias = false;
        this.categorias = [];
        // Habilitar el control pero mostrar mensaje de error
        this.hotelForm.get('categoriaId')?.enable();
      }
    });
  }

  // Cargar hoteles
  cargarHoteles(): void {
    this.cargando = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles;
        this.hotelesFiltrados = [...this.hoteles];
        this.totalHoteles = this.hoteles.length;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando hoteles:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los hoteles');
        this.cargando = false;
      }
    });
  }

  // Cargar usuarios
  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  // Obtener nombre de ciudad
  obtenerNombreCiudad(ciudadId: number): string {
    const ciudad = this.ciudades.find(c => c.id === ciudadId);
    return ciudad ? ciudad.nombre : 'Ciudad desconocida';
  }

  // Obtener nombre de categoría desde BD
  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  // Método para obtener el label de la categoría (usado en el template)
  getCategoriaLabel(categoriaId: number): string {
    return this.obtenerNombreCategoria(categoriaId);
  }

  // Obtener clase para badge de categoría basado en numeroEstrellas o nombre
  getCategoriaBadgeClass(categoriaId: number): string {
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
    this.filtroCategoria = categoriaId;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.hoteles];
    
    if (this.filtroCategoria) {
      resultado = resultado.filter(h => h.categoriaId === this.filtroCategoria);
    }
    
    if (this.filtroTexto) {
      resultado = resultado.filter(hotel =>
        hotel.nombre.toLowerCase().includes(this.filtroTexto) ||
        hotel.descripcion.toLowerCase().includes(this.filtroTexto) ||
        hotel.contactos.toLowerCase().includes(this.filtroTexto) ||
        this.obtenerNombreCiudad(hotel.ciudadId!).toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.hotelesFiltrados = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.hotelEditando = null;
    
    // Asegurarse de que los controles estén habilitados antes de resetear
    this.hotelForm.get('ciudadId')?.enable();
    this.hotelForm.get('categoriaId')?.enable();
    
    this.hotelForm.reset({
      nombre: '',
      descripcion: '',
      contactos: '',
      contrasena: 'hotel123',
      ciudadId: '',
      categoriaId: '',
      habitaciones: null,
      precioPromedio: null
    });
    
    // Si no hay datos, deshabilitar los controles
    if (this.ciudades.length === 0) {
      this.hotelForm.get('ciudadId')?.disable();
    }
    if (this.categorias.length === 0) {
      this.hotelForm.get('categoriaId')?.disable();
    }
    
    this.hotelForm.markAsPristine();
    this.hotelForm.markAsUntouched();
  }

  // Editar hotel
  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    
    // Habilitar controles antes de editar
    this.hotelForm.get('ciudadId')?.enable();
    this.hotelForm.get('categoriaId')?.enable();
    
    this.hotelForm.patchValue({
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      contrasena: hotel.contrasena || 'hotel123',
      ciudadId: hotel.ciudadId?.toString(),
      categoriaId: hotel.categoriaId?.toString(),
      habitaciones: hotel.habitaciones || null,
      precioPromedio: hotel.precioPromedio || null
    });
  }

  // Guardar hotel
  guardarHotel(): void {
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

    // Verificar que haya categorías disponibles
    if (this.categorias.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay categorías disponibles en la base de datos.'
      );
      return;
    }

    // Verificar que haya ciudades disponibles
    if (this.ciudades.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay ciudades disponibles en la base de datos.'
      );
      return;
    }

    this.guardando = true;
    const hotelData = this.hotelForm.getRawValue(); // Usar getRawValue() para obtener valores de controles disabled
    
    let guardarHotelObservable;
    if (this.modoEdicion && this.hotelEditando && this.hotelEditando.id) {
      guardarHotelObservable = this.hotelService.updateHotel(this.hotelEditando.id, hotelData);
    } else {
      guardarHotelObservable = this.hotelService.createHotel(hotelData);
    }

    guardarHotelObservable.subscribe({
      next: (hotelGuardado: Hotel) => {
        this.cargarHoteles();
        this.guardando = false;
        this.nuevoRegistro();
        
        this.mostrarNotificacion('success', 
          this.modoEdicion ? 'Hotel actualizado' : 'Hotel creado',
          `Hotel "${hotelData.nombre}" guardado correctamente.`
        );
      },
      error: (error: any) => {
        console.error('Error guardando hotel:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo guardar el hotel. Intenta nuevamente.'
        );
      }
    });
  }

  // Método para guardar usuario
  guardarUsuario(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });

    if (this.usuarioForm.invalid) {
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
      return;
    }

    this.guardandoUsuario = true;
    const usuarioData = this.usuarioForm.value;

    this.usuarioService.createUsuario(usuarioData).subscribe({
      next: (usuarioGuardado: Usuario) => {
        this.guardandoUsuario = false;
        this.usuarioForm.reset({
          nombre: '',
          apellidos: '',
          telefono: '',
          nacionalidad: '',
          numPasaporte: '',
          contrasena: '',
          rol: 'usuario'
        });
        this.mostrarNotificacion('success', 
          'Usuario creado',
          `Usuario "${usuarioData.nombre} ${usuarioData.apellidos}" guardado correctamente.`
        );
        this.cargarUsuarios(); // Recargar la lista de usuarios
      },
      error: (error: any) => {
        console.error('Error guardando usuario:', error);
        this.guardandoUsuario = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo guardar el usuario. Intenta nuevamente.'
        );
      }
    });
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
    this.hotelService.deleteHotel(this.hotelAEliminar.id).subscribe({
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