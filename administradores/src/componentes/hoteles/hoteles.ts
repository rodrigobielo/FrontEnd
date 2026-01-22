import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Servicios
import { HotelService } from '../../servicios/hotel.service';
import { CiudadService } from '../../servicios/ciudades.service';
import { CategoriaService } from '../../servicios/categoria.service';
import { ImagenService } from '../../servicios/imagen.service';
import { UsuarioService } from '../../servicios/usuario.service';

// Modelos
import { Ciudad } from '../../modelos/ciudad.model';
import { Categoria } from '../../modelos/categoria.model';
import { Imagen } from '../../modelos/imagen.model';
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
  private imagenService = inject(ImagenService);
  private usuarioService = inject(UsuarioService);
  private fb = inject(FormBuilder);
  
  // Formularios
  hotelForm: FormGroup;
  usuarioForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  guardandoUsuario: boolean = false;
  filtroCategoria: number | null = null;
  filtroTexto: string = '';
  
  // Datos
  ciudades: Ciudad[] = [];
  categorias: Categoria[] = []; // Categorías reales desde BD
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  // Imágenes del hotel actual
  imagenesHotel: Imagen[] = [];
  
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
      ciudadId: ['', [Validators.required]],
      categoriaId: ['', [Validators.required]],
      habitaciones: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      precioPromedio: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      imagenes: this.fb.array([])
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

  // Getter para el FormArray de imágenes
  get imagenesArray(): FormArray {
    return this.hotelForm.get('imagenes') as FormArray;
  }

  // Método para agregar imagen
  agregarImagen(url: string): void {
    if (url && url.trim() !== '') {
      this.imagenesArray.push(this.fb.control(url.trim()));
    }
  }

  // Método para eliminar imagen
  eliminarImagen(index: number): void {
    this.imagenesArray.removeAt(index);
  }

  // Método para vista previa de imagen
  previewImagen(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: Event, tipo: 'principal' | 'secundaria'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        // En producción, aquí subirías la imagen al servidor
        // Por ahora, simulamos una URL
        const fakeUrl = `https://fakeimg.pl/600x400/?text=Imagen+${tipo}`;
        this.agregarImagen(fakeUrl);
        
        this.mostrarNotificacion('success', 
          'Imagen cargada', 
          `Imagen ${tipo} cargada correctamente. (Simulación)`
        );
      };
      reader.readAsDataURL(file);
    }
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

  // Cargar ciudades
  cargarCiudades(): void {
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades: Ciudad[]) => {
        this.ciudades = ciudades;
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las ciudades');
      }
    });
  }

  // Cargar categorías desde la base de datos
  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
        console.log('Categorías cargadas:', categorias);
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las categorías');
        // Opcional: cargar categorías por defecto si falla
        this.cargarCategoriasPorDefecto();
      }
    });
  }

  // Método opcional para cargar categorías por defecto si falla la conexión
  cargarCategoriasPorDefecto(): void {
    this.categorias = [
      { id: 1, nombre: '⭐ 1 Estrella (Económico)' } as Categoria,
      { id: 2, nombre: '⭐⭐ 2 Estrellas (Básico)' } as Categoria,
      { id: 3, nombre: '⭐⭐⭐ 3 Estrellas (Confort)' } as Categoria,
      { id: 4, nombre: '⭐⭐⭐⭐ 4 Estrellas (Superior)' } as Categoria,
      { id: 5, nombre: '⭐⭐⭐⭐⭐ 5 Estrellas (Lujo)' } as Categoria,
      { id: 6, nombre: '🏨 Boutique' } as Categoria,
      { id: 7, nombre: '🏢 Apart Hotel' } as Categoria,
      { id: 8, nombre: '🛏️ Hostel' } as Categoria
    ];
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

  // Obtener clase para badge de categoría (ajusta según tus categorías en BD)
  getCategoriaBadgeClass(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    const nombreCategoria = categoria ? categoria.nombre.toLowerCase() : '';
    
    // Asigna clases basadas en el nombre o contenido de la categoría
    if (nombreCategoria.includes('1 estrella') || nombreCategoria.includes('económico')) {
      return 'badge text-bg-secondary';
    } else if (nombreCategoria.includes('2 estrellas') || nombreCategoria.includes('básico')) {
      return 'badge text-bg-secondary';
    } else if (nombreCategoria.includes('3 estrellas') || nombreCategoria.includes('confort')) {
      return 'badge text-bg-primary';
    } else if (nombreCategoria.includes('4 estrellas') || nombreCategoria.includes('superior')) {
      return 'badge text-bg-info';
    } else if (nombreCategoria.includes('5 estrellas') || nombreCategoria.includes('lujo')) {
      return 'badge text-bg-warning';
    } else if (nombreCategoria.includes('boutique')) {
      return 'badge text-bg-purple';
    } else if (nombreCategoria.includes('apart') || nombreCategoria.includes('apart hotel')) {
      return 'badge text-bg-success';
    } else if (nombreCategoria.includes('hostel')) {
      return 'badge text-bg-light text-dark';
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
    this.imagenesHotel = [];
    this.imagenesArray.clear();
    
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
    
    this.hotelForm.markAsPristine();
    this.hotelForm.markAsUntouched();
  }

  // Editar hotel
  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    this.imagenesHotel = hotel.imagenes || [];
    
    this.imagenesArray.clear();
    this.imagenesHotel.forEach(imagen => {
      this.imagenesArray.push(this.fb.control(imagen.url));
    });
    
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

  // Guardar hotel con imágenes
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

    this.guardando = true;
    const hotelData = this.hotelForm.value;
    
    const guardarHotelObservable = this.modoEdicion && this.hotelEditando?.id
      ? this.hotelService.updateHotel(this.hotelEditando.id, hotelData)
      : this.hotelService.createHotel(hotelData);

    guardarHotelObservable.subscribe({
      next: (hotelGuardado: Hotel) => {
        // Guardar imágenes si hay
        const imagenesUrls = this.imagenesArray.value;
        if (imagenesUrls.length > 0) {
          imagenesUrls.forEach((url: string) => {
            const imagen: Imagen = { url: url };
            this.imagenService.createImagen(imagen).subscribe({
              next: () => console.log('Imagen guardada'),
              error: (error: any) => console.error('Error guardando imagen:', error)
            });
          });
        }
        
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

  // Guardar usuario (parámetros de conexión)
  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.mostrarNotificacion('error', 'Formulario inválido', 'Completa todos los campos del usuario.');
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
          'Parámetros de conexión guardados correctamente.'
        );
        
        this.cargarUsuarios();
      },
      error: (error: any) => {
        console.error('Error guardando usuario:', error);
        this.guardandoUsuario = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudo guardar el usuario.');
      }
    });
  }

  // Ver detalles
  verDetalles(hotel: Hotel): void {
    this.hotelDetalles = hotel;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar hotel
  eliminarHotel(hotel: Hotel): void {
    this.hotelAEliminar = hotel;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  confirmarEliminar(): void {
    if (!this.hotelAEliminar?.id) return;
    
    this.hotelService.deleteHotel(this.hotelAEliminar.id).subscribe({
      next: () => {
        this.cargarHoteles();
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.mostrarNotificacion('info', 
          'Hotel eliminado',
          `Hotel "${this.hotelAEliminar!.nombre}" eliminado correctamente.`
        );
        this.hotelAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando hotel:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudo eliminar el hotel.');
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
      }
    });
  }

  // Manejo de errores en imágenes
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSI+SW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
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