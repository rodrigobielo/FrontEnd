import { Component, OnInit } from '@angular/core';
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
  templateUrl: './hoteles.html',  // ← CORREGIDO: antes decía ciudades.html
  styleUrls: ['./hoteles.css']
})
export class Hoteles implements OnInit {  // ← La clase se llama Hoteles (con 's')
  
  hotelForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoCiudades: boolean = false;
  cargandoCategorias: boolean = false;
  cargandoAdministradores: boolean = false;
  formularioVisible: boolean = false;
  filtroCategoria: number | null = null;
  filtroTexto: string = '';
  
  ciudades: Ciudad[] = [];
  categorias: Categoria[] = [];
  administradores: Usuario[] = [];
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  totalHoteles: number = 0;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

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
  }

  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.hotelEditando = null;
    this.hotelForm.reset();
  }

  cargarCiudades(): void {
    this.cargandoCiudades = true;
    this.ciudadService.getCiudades().subscribe({
      next: (ciudades: Ciudad[]) => {
        this.ciudades = ciudades || [];
        this.cargandoCiudades = false;
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.cargandoCiudades = false;
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
      },
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.cargandoCategorias = false;
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
      },
      error: (error: any) => {
        console.error('Error cargando administradores:', error);
        this.cargandoAdministradores = false;
        this.administradores = [];
      }
    });
  }

  cargarHoteles(): void {
    this.cargando = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.hotelesFiltrados = [...this.hoteles];
        this.totalHoteles = this.hoteles.length;
        this.cargando = false;
        this.paginaActual = 1;
      },
      error: (error: any) => {
        console.error('Error cargando hoteles:', error);
        this.cargando = false;
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
        case 1: return 'badge bg-secondary';
        case 2: return 'badge bg-primary';
        case 3: return 'badge bg-info text-dark';
        case 4: return 'badge bg-success';
        case 5: return 'badge bg-warning text-dark';
        default: return 'badge bg-secondary';
      }
    }
    return 'badge bg-secondary';
  }

  filtrarHoteles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
    this.paginaActual = 1;
  }

  filtrarPorCategoria(categoriaId: number): void {
    this.filtroCategoria = categoriaId === 0 ? null : categoriaId;
    this.aplicarFiltros();
    this.paginaActual = 1;
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

  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    this.formularioVisible = true;
    
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

  guardarHotel(): void {
    Object.keys(this.hotelForm.controls).forEach(key => {
      this.hotelForm.get(key)?.markAsTouched();
    });

    if (this.hotelForm.invalid) {
      return;
    }

    this.guardando = true;
    const hotelData = this.hotelForm.value;
    
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
        },
        error: (error: any) => {
          console.error('Error actualizando hotel:', error);
          this.guardando = false;
        }
      });
    } else {
      this.hotelService.createHotel(hotelParaEnviar).subscribe({
        next: () => {
          this.cargarHoteles();
          this.guardando = false;
          this.cerrarFormulario();
        },
        error: (error: any) => {
          console.error('Error creando hotel:', error);
          this.guardando = false;
        }
      });
    }
  }

  verDetalles(hotel: Hotel): void {
    this.hotelDetalles = hotel;
    const modalElement = document.getElementById('detallesModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  eliminarHotel(hotel: Hotel): void {
    this.hotelAEliminar = hotel;
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmarEliminar(): void {
    if (this.hotelAEliminar?.id) {
      this.hotelService.deleteHotel(this.hotelAEliminar.id).subscribe({
        next: () => {
          this.cargarHoteles();
          const modalElement = document.getElementById('confirmarEliminarModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
          this.hotelAEliminar = null;
        },
        error: (error: any) => {
          console.error('Error eliminando hotel:', error);
        }
      });
    }
  }
}