import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

interface Region {
  id: number;
  nombre: string;
  descripcion: string;
  codigo?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-regiones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './regiones.html',
  styleUrls: ['./regiones.css']
})
export class Regiones implements OnInit, OnDestroy {
  // Formulario reactivo
  regionForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  
  // Datos
  regiones: Region[] = [];
  regionesFiltradas: Region[] = [];
  regionEditando: Region | null = null;
  regionAEliminar: Region | null = null;
  
  // Estadísticas
  totalRegiones: number = 0;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.regionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      codigo: ['']
    });
  }

  ngOnInit(): void {
    // Verificar si la ruta es para nuevo registro
    this.route.url.subscribe(url => {
      if (url.length > 0 && url[0].path === 'nuevo') {
        this.nuevoRegistro();
      }
    });
    
    this.cargarRegiones();
  }

  ngOnDestroy(): void {
    // Código de limpieza si es necesario
  }

  cargarRegiones(): void {
    this.cargando = true;
    
    // Simulación de carga de datos
    setTimeout(() => {
      this.regiones = [
        {
          id: 1,
          nombre: 'Costa Norte',
          descripcion: 'Región costera con playas tropicales y clima cálido durante todo el año',
          codigo: 'CN-01',
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Región Andina',
          descripcion: 'Zona montañosa con paisajes espectaculares y culturas ancestrales',
          codigo: 'AND-001',
          fechaCreacion: new Date('2024-02-20')
        },
        {
          id: 3,
          nombre: 'Selva Amazónica',
          descripcion: 'Área de biodiversidad con flora y fauna únicas en el mundo',
          fechaCreacion: new Date('2024-03-10')
        }
      ];
      
      this.regionesFiltradas = [...this.regiones];
      this.totalRegiones = this.regiones.length;
      this.cargando = false;
    }, 1000);
  }

  // Filtrar regiones por nombre
  filtrarRegiones(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase();
    
    if (filtro) {
      this.regionesFiltradas = this.regiones.filter(region =>
        region.nombre.toLowerCase().includes(filtro) ||
        region.descripcion.toLowerCase().includes(filtro) ||
        (region.codigo && region.codigo.toLowerCase().includes(filtro))
      );
    } else {
      this.regionesFiltradas = [...this.regiones];
    }
  }

  // Iniciar nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.regionEditando = null;
    this.regionForm.reset();
    this.regionForm.markAsPristine();
    this.regionForm.markAsUntouched();
  }

  // Editar región existente
  editarRegion(region: Region): void {
    this.modoEdicion = true;
    this.regionEditando = region;
    
    this.regionForm.patchValue({
      nombre: region.nombre,
      descripcion: region.descripcion,
      codigo: region.codigo || ''
    });
    
    // Scroll suave al formulario
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Guardar región (crear o actualizar)
  guardarRegion(): void {
    if (this.regionForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.regionForm.controls).forEach(key => {
        const control = this.regionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    
    const regionData = this.regionForm.value;
    
    // Simulación de guardado
    setTimeout(() => {
      if (this.modoEdicion && this.regionEditando) {
        // Actualizar región existente
        const index = this.regiones.findIndex(r => r.id === this.regionEditando!.id);
        if (index !== -1) {
          this.regiones[index] = {
            ...this.regionEditando,
            ...regionData
          };
        }
      } else {
        // Crear nueva región
        const nuevaRegion: Region = {
          id: Math.max(...this.regiones.map(r => r.id)) + 1,
          nombre: regionData.nombre,
          descripcion: regionData.descripcion,
          codigo: regionData.codigo || undefined,
          fechaCreacion: new Date()
        };
        this.regiones.unshift(nuevaRegion);
        this.totalRegiones = this.regiones.length;
      }
      
      this.regionesFiltradas = [...this.regiones];
      this.guardando = false;
      this.nuevoRegistro();
      
      // Mostrar mensaje de éxito (simulación)
      this.mostrarMensajeExito();
    }, 1500);
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.nuevoRegistro();
  }

  // Ver detalles de región
  verDetalles(region: Region): void {
    console.log('Ver detalles:', region);
    // Aquí podrías abrir un modal con más información
  }

  // Eliminar región
  eliminarRegion(region: Region): void {
    this.regionAEliminar = region;
    
    // Mostrar modal de confirmación usando Bootstrap
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (this.regionAEliminar) {
      const index = this.regiones.findIndex(r => r.id === this.regionAEliminar!.id);
      if (index !== -1) {
        this.regiones.splice(index, 1);
        this.regionesFiltradas = [...this.regiones];
        this.totalRegiones = this.regiones.length;
        
        // Cerrar modal
        const modalElement = document.getElementById('confirmarEliminarModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal.hide();
        }
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeEliminacion();
      }
    }
    this.regionAEliminar = null;
  }

  // Mostrar mensaje de éxito (simulación)
  private mostrarMensajeExito(): void {
    // En una implementación real, usarías un servicio de notificaciones
    alert('¡Región guardada exitosamente!');
  }

  private mostrarMensajeEliminacion(): void {
    // En una implementación real, usarías un servicio de notificaciones
    alert('¡Región eliminada exitosamente!');
  }
}