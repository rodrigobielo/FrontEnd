import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CiudadService } from '../../servicios/ciudades.service';
import { ProvinciaService } from '../../servicios/provincia.service';
import { AuthService } from '../../servicios/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Ciudad {
  id: number;
  nombre: string;
  descripcion: string;
  provinciaId: number;
}

interface Provincia {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css']
})
export class Ciudades implements OnInit, AfterViewInit, OnDestroy {
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  provincias: Provincia[] = [];
  ciudadForm: FormGroup;
  ciudadEditando: Ciudad | null = null;
  ciudadDetalles: Ciudad | null = null;
  ciudadAEliminar: Ciudad | null = null;
  
  // Estados
  cargando: boolean = true;
  cargandoProvincias: boolean = false;
  guardando: boolean = false;
  modoEdicion: boolean = false;
  
  // Filtros
  filtro: string = '';
  filtroProvincia: number = 0;
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  errorMessage: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private ciudadService: CiudadService,
    private provinciaService: ProvinciaService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) { 
    this.ciudadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      provinciaId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.cargarProvincias();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cargarCiudades();
    }, 0);
  }

  cargarProvincias(): void {
    this.cargandoProvincias = true;
    this.provinciaService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Provincia[]) => {
          console.log('Provincias cargadas:', data);
          this.provincias = Array.isArray(data) ? data : [];
          this.cargandoProvincias = false;
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('Error cargando provincias:', error);
          this.errorMessage = 'Error al cargar las provincias';
          this.cargandoProvincias = false;
          this.cargando = false;
        }
      });
  }

  cargarCiudades(): void {
    this.cargando = true;
    this.ciudadService.getCiudades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Ciudad[]) => {
          console.log('Ciudades cargadas:', data);
          this.ciudades = Array.isArray(data) ? data : [];
          this.ciudadesFiltradas = [...this.ciudades];
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error cargando ciudades:', error);
          this.errorMessage = 'Error al cargar las ciudades';
          this.ciudades = [];
          this.ciudadesFiltradas = [];
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset();
  }

  guardarCiudad(): void {
    if (this.ciudadForm.invalid) {
      return;
    }

    this.guardando = true;
    const ciudadData = this.ciudadForm.value;

    if (this.modoEdicion && this.ciudadEditando) {
      this.ciudadService.update(this.ciudadEditando.id, ciudadData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cargarCiudades();
            this.ciudadForm.reset();
            this.modoEdicion = false;
            this.ciudadEditando = null;
          },
          error: (error: any) => {
            console.error('Error actualizando ciudad:', error);
            this.errorMessage = 'Error al actualizar la ciudad';
            this.guardando = false;
          }
        });
    } else {
      this.ciudadService.create(ciudadData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.guardando = false;
            this.cargarCiudades();
            this.ciudadForm.reset();
          },
          error: (error: any) => {
            console.error('Error creando ciudad:', error);
            this.errorMessage = 'Error al crear la ciudad';
            this.guardando = false;
          }
        });
    }
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset();
  }

  editarCiudad(ciudad: Ciudad): void {
    this.modoEdicion = true;
    this.ciudadEditando = ciudad;
    this.ciudadForm.patchValue({
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provinciaId: ciudad.provinciaId
    });
  }

  verDetalles(ciudad: Ciudad): void {
    this.ciudadDetalles = ciudad;
  }

  eliminarCiudad(ciudad: Ciudad): void {
    this.ciudadAEliminar = ciudad;
  }

  confirmarEliminar(): void {
    if (this.ciudadAEliminar) {
      this.ciudadService.delete(this.ciudadAEliminar.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cargarCiudades();
            this.ciudadAEliminar = null;
          },
          error: (error: any) => {
            console.error('Error eliminando ciudad:', error);
            this.errorMessage = 'Error al eliminar la ciudad';
            this.ciudadAEliminar = null;
          }
        });
    }
  }

  filtrarCiudades(event: any): void {
    this.filtro = event.target.value;
    this.aplicarFiltro();
  }

  filtrarPorProvincia(provinciaId: number): void {
    this.filtroProvincia = provinciaId;
    if (provinciaId === 0) {
      this.ciudadesFiltradas = [...this.ciudades];
    } else {
      this.ciudadesFiltradas = this.ciudades.filter(ciudad => ciudad.provinciaId === provinciaId);
    }
    this.paginaActual = 1;
  }

  aplicarFiltro(): void {
    if (!this.filtro.trim()) {
      this.ciudadesFiltradas = this.filtroProvincia === 0 
        ? [...this.ciudades] 
        : this.ciudades.filter(ciudad => ciudad.provinciaId === this.filtroProvincia);
      this.paginaActual = 1;
      return;
    }

    const filtroLower = this.filtro.toLowerCase();
    this.ciudadesFiltradas = this.ciudades.filter(ciudad => {
      const coincideNombre = ciudad.nombre.toLowerCase().includes(filtroLower);
      const coincideDescripcion = ciudad.descripcion.toLowerCase().includes(filtroLower);
      const coincideProvincia = this.obtenerNombreProvincia(ciudad.provinciaId).toLowerCase().includes(filtroLower);
      return coincideNombre || coincideDescripcion || coincideProvincia;
    });

    if (this.filtroProvincia !== 0) {
      this.ciudadesFiltradas = this.ciudadesFiltradas.filter(ciudad => ciudad.provinciaId === this.filtroProvincia);
    }
    
    this.paginaActual = 1;
  }

  obtenerNombreProvincia(provinciaId: number): string {
    const provincia = this.provincias.find(p => p.id === provinciaId);
    return provincia ? provincia.nombre : 'Desconocida';
  }

  get totalCiudades(): number {
    return this.ciudades.length;
  }

  get ciudadesPaginadas(): Ciudad[] {
    const startIndex = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.ciudadesFiltradas.slice(startIndex, startIndex + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.ciudadesFiltradas.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  limpiarFiltro(): void {
    this.filtro = '';
    this.filtroProvincia = 0;
    this.ciudadesFiltradas = [...this.ciudades];
    this.paginaActual = 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}