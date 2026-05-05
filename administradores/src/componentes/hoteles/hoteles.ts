import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './hoteles.html',
  styleUrls: ['./hoteles.css']
})
export class Hoteles implements OnInit, OnDestroy {
  
  hotelForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoCiudades: boolean = false;
  cargandoCategorias: boolean = false;
  cargandoAdministradores: boolean = false;
  formularioVisible: boolean = false;
  filtroCategoria: number | null = null;
  
  // Mensajes con toasts
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Datos
  ciudades: Ciudad[] = [];
  categorias: Categoria[] = [];
  administradores: Usuario[] = [];
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  // Estadísticas
  totalHoteles: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  
  // Temporizadores
  private timeoutExito: any;
  private timeoutError: any;
  private timeoutInfo: any;
  
  // Modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private ciudadService: CiudadService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService
  ) {
    this.hotelForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      contactos: ['', [Validators.required, Validators.minLength(10)]],
      precio: [0, [Validators.required, Validators.min(0.01), Validators.max(10000)]],
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
    this.initModales();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
    this.destroyModales();
  }

  private limpiarTemporizadores(): void {
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    if (this.timeoutError) clearTimeout(this.timeoutError);
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
  }

  private mostrarExito(mensaje: string): void {
    this.mostrarMensajeExito = true;
    this.mensajeExito = mensaje;
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    this.timeoutExito = setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensajeExito = '';
    }, 4000);
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    if (this.timeoutError) clearTimeout(this.timeoutError);
    this.timeoutError = setTimeout(() => {
      this.mostrarMensajeError = false;
      this.mensajeError = '';
    }, 5000);
  }

  private mostrarInfo(mensaje: string): void {
    this.mostrarMensajeInfo = true;
    this.mensajeInfo = mensaje;
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
    this.timeoutInfo = setTimeout(() => {
      this.mostrarMensajeInfo = false;
      this.mensajeInfo = '';
    }, 3000);
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

  mostrarFormulario(): void {
    this.formularioVisible = true;
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
    this.limpiarTemporizadores();
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.modern-form');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.hotelEditando = null;
    this.hotelForm.reset();
    this.limpiarTemporizadores();
  }

  cargarCiudades(): void {
    this.cargandoCiudades = true;
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades: Ciudad[]) => {
        this.ciudades = ciudades || [];
        this.cargandoCiudades = false;
        
        if (this.ciudades.length === 0) {
          this.mostrarInfo('No hay ciudades disponibles. Debes crear ciudades primero.');
        }
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.cargandoCiudades = false;
        this.mostrarError('Error al cargar las ciudades');
        this.ciudades = [];
      }
    });
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.categoriaService.getCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias || [];
        this.cargandoCategorias = false;
        
        if (this.categorias.length === 0) {
          this.mostrarInfo('No hay categorías disponibles. Debes crear categorías primero.');
        }
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.cargandoCategorias = false;
        this.mostrarError('Error al cargar las categorías');
        this.categorias = [];
      }
    });
  }

  cargarAdministradores(): void {
    this.cargandoAdministradores = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.administradores = (usuarios || []).filter((usuario: Usuario) => 
          usuario.roles?.nombre?.toLowerCase().includes('admin') || 
          usuario.roles?.nombre?.toLowerCase().includes('administrador')
        );
        this.cargandoAdministradores = false;
        
        if (this.administradores.length === 0) {
          this.mostrarInfo('No hay administradores disponibles.');
        }
      },
      error: (error: any) => {
        console.error('Error cargando administradores:', error);
        this.cargandoAdministradores = false;
        this.mostrarError('Error al cargar los administradores');
        this.administradores = [];
      }
    });
  }

  cargarHoteles(): void {
    this.cargando = true;
    this.limpiarTemporizadores();
    
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.hotelesFiltrados = [...this.hoteles];
        this.totalHoteles = this.hoteles.length;
        this.cargando = false;
        this.paginaActual = 1;
        
        if (this.hoteles.length === 0) {
          this.mostrarInfo('No se encontraron hoteles registrados');
        }
      },
      error: (error: any) => {
        console.error('Error cargando hoteles:', error);
        this.cargando = false;
        this.mostrarError(error.message || 'Error al cargar los hoteles');
        this.hoteles = [];
        this.hotelesFiltrados = [];
      }
    });
  }

  obtenerNombreCategoria(categoriaId: number): string {
    if (!categoriaId) return 'Todas las categorías';
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : `Categoría ${categoriaId}`;
  }

  getCategoriaBadgeClass(categoriaId?: number): string {
    if (!categoriaId) return 'badge bg-secondary';
    const categoria = this.categorias.find(c => c.id === categoriaId);
    if (!categoria) return 'badge bg-secondary';
    
    if (categoria.numeroEstrellas) {
      switch (categoria.numeroEstrellas) {
        case 1: return 'badge bg-secondary px-3 py-2';
        case 2: return 'badge bg-primary px-3 py-2';
        case 3: return 'badge bg-info text-dark px-3 py-2';
        case 4: return 'badge bg-success px-3 py-2';
        case 5: return 'badge bg-warning text-dark px-3 py-2';
        default: return 'badge bg-secondary px-3 py-2';
      }
    }
    return 'badge bg-secondary px-3 py-2';
  }

  filtrarHoteles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    let resultado = [...this.hoteles];
    
    if (this.filtroCategoria) {
      resultado = resultado.filter(h => h.categorias?.id === this.filtroCategoria);
    }
    
    if (filtro) {
      resultado = resultado.filter(hotel =>
        hotel.nombre.toLowerCase().includes(filtro) ||
        hotel.descripcion.toLowerCase().includes(filtro) ||
        hotel.contactos.toLowerCase().includes(filtro) ||
        hotel.ciudades?.nombre.toLowerCase().includes(filtro) ||
        hotel.categorias?.nombre.toLowerCase().includes(filtro)
      );
      
      if (resultado.length === 0) {
        this.mostrarInfo(`No se encontraron hoteles con "${filtro}"`);
      }
    }
    
    this.hotelesFiltrados = resultado;
    this.paginaActual = 1;
  }

  filtrarPorCategoria(categoriaId: number): void {
    this.filtroCategoria = categoriaId === 0 ? null : categoriaId;
    
    if (this.filtroCategoria) {
      const nombreCategoria = this.obtenerNombreCategoria(this.filtroCategoria);
      this.mostrarExito(`Mostrando hoteles de categoría "${nombreCategoria}"`);
    } else {
      this.mostrarInfo('Mostrando todos los hoteles');
    }
    
    this.aplicarFiltros();
    this.paginaActual = 1;
  }

  private aplicarFiltros(): void {
    let resultado = [...this.hoteles];
    
    if (this.filtroCategoria) {
      resultado = resultado.filter(h => h.categorias?.id === this.filtroCategoria);
    }
    
    this.hotelesFiltrados = resultado;
  }

  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    this.formularioVisible = true;
    this.limpiarTemporizadores();
    
    this.hotelForm.patchValue({
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      precio: hotel.precio || 0,
      ciudadId: hotel.ciudades?.id || '',
      categoriaId: hotel.categorias?.id || '',
      administradorId: hotel.usuarios?.id || ''
    });
    
    this.hotelForm.markAsPristine();
    Object.keys(this.hotelForm.controls).forEach(key => {
      this.hotelForm.get(key)?.markAsUntouched();
    });
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.modern-form');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  guardarHotel(): void {
    Object.keys(this.hotelForm.controls).forEach(key => {
      this.hotelForm.get(key)?.markAsTouched();
    });

    if (this.hotelForm.invalid) {
      this.mostrarError('Complete todos los campos obligatorios correctamente');
      return;
    }

    this.guardando = true;
    const hotelData = this.hotelForm.value;
    const nombreHotel = hotelData.nombre;
    
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

    if (this.modoEdicion && this.hotelEditando?.id) {
      this.hotelService.updateHotel(this.hotelEditando.id, hotelParaEnviar).subscribe({
        next: () => {
          this.cargarHoteles();
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Hotel "${nombreHotel}" actualizado correctamente`);
        },
        error: (error: any) => {
          console.error('Error actualizando hotel:', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al actualizar el hotel');
        }
      });
    } else {
      this.hotelService.createHotel(hotelParaEnviar).subscribe({
        next: () => {
          this.cargarHoteles();
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Hotel "${nombreHotel}" creado correctamente`);
          this.paginaActual = 1;
        },
        error: (error: any) => {
          console.error('Error creando hotel:', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al crear el hotel');
        }
      });
    }
  }

  verDetalles(hotel: Hotel): void {
    this.hotelDetalles = hotel;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  eliminarHotel(hotel: Hotel): void {
    this.hotelAEliminar = hotel;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  confirmarEliminar(): void {
    if (this.hotelAEliminar?.id) {
      const nombreHotel = this.hotelAEliminar.nombre;
      
      this.hotelService.deleteHotel(this.hotelAEliminar.id).subscribe({
        next: () => {
          this.cargarHoteles();
          
          if (this.confirmarModalInstance) {
            this.confirmarModalInstance.hide();
          }
          
          if (this.hotelEditando?.id === this.hotelAEliminar?.id) {
            this.cerrarFormulario();
          }
          
          this.mostrarExito(`🗑️ Hotel "${nombreHotel}" eliminado correctamente`);
          this.hotelAEliminar = null;
        },
        error: (error: any) => {
          console.error('Error eliminando hotel:', error);
          this.mostrarError(error.message || 'Error al eliminar el hotel');
        }
      });
    }
  }
}