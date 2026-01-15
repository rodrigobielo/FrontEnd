import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

interface Region {
  id: number;
  nombre: string;
  descripcion: string;
  codigo?: string;
}

interface Provincia {
  id: number;
  nombre: string;
  regionId: number;
  codigo?: string;
  poblacion?: number;
  area?: number;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './provincias.html',
  styleUrls: ['./provincias.css']
})
export class Provincias implements OnInit, OnDestroy {
  // Formulario reactivo
  provinciaForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  filtroRegion: number = 0;
  
  // Datos
  regiones: Region[] = [];
  provincias: Provincia[] = [];
  provinciasFiltradas: Provincia[] = [];
  provinciaEditando: Provincia | null = null;
  provinciaAEliminar: Provincia | null = null;
  
  // Estadísticas
  totalProvincias: number = 0;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.provinciaForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      regionId: ['', [Validators.required, Validators.min(1)]],
      codigo: ['', [
        Validators.maxLength(10),
        Validators.pattern(/^[A-Z]{2,10}$/)
      ]],
      poblacion: [null, [
        Validators.min(0),
        Validators.max(100000000)
      ]],
      area: [null, [
        Validators.min(0),
        Validators.max(10000000)
      ]]
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
    this.cargarProvincias();
  }

  ngOnDestroy(): void {
    // Código de limpieza si es necesario
  }

  // Cargar regiones
  cargarRegiones(): void {
    // Datos de ejemplo para regiones (en producción vendría de un servicio)
    this.regiones = [
      {
        id: 1,
        nombre: 'Costa Norte',
        descripcion: 'Región costera con playas tropicales',
        codigo: 'CN-01'
      },
      {
        id: 2,
        nombre: 'Región Andina',
        descripcion: 'Zona montañosa con paisajes espectaculares',
        codigo: 'AND-001'
      },
      {
        id: 3,
        nombre: 'Selva Amazónica',
        descripcion: 'Área de biodiversidad con flora y fauna únicas',
        codigo: 'AMZ-001'
      },
      {
        id: 4,
        nombre: 'Región Central',
        descripcion: 'Zona urbana y comercial principal',
        codigo: 'CEN-001'
      },
      {
        id: 5,
        nombre: 'Región Sur',
        descripcion: 'Zona fría con paisajes patagónicos',
        codigo: 'SUR-001'
      }
    ];
  }

  // Cargar provincias
  cargarProvincias(): void {
    this.cargando = true;
    
    // Simulación de carga de datos desde API
    setTimeout(() => {
      this.provincias = [
        {
          id: 1,
          nombre: 'Jujuy',
          regionId: 2,
          codigo: 'JUJ',
          poblacion: 673307,
          area: 53219,
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Salta',
          regionId: 2,
          codigo: 'SAL',
          poblacion: 1333000,
          area: 155488,
          fechaCreacion: new Date('2024-01-20')
        },
        {
          id: 3,
          nombre: 'Mendoza',
          regionId: 2,
          codigo: 'MEN',
          poblacion: 1990000,
          area: 148827,
          fechaCreacion: new Date('2024-02-05')
        },
        {
          id: 4,
          nombre: 'Buenos Aires',
          regionId: 4,
          codigo: 'BA',
          poblacion: 17541141,
          area: 307571,
          fechaCreacion: new Date('2024-02-10')
        },
        {
          id: 5,
          nombre: 'Misiones',
          regionId: 3,
          codigo: 'MIS',
          poblacion: 1269675,
          area: 29801,
          fechaCreacion: new Date('2024-02-15')
        },
        {
          id: 6,
          nombre: 'Chubut',
          regionId: 5,
          codigo: 'CHU',
          poblacion: 618994,
          area: 224686,
          fechaCreacion: new Date('2024-02-20')
        },
        {
          id: 7,
          nombre: 'Córdoba',
          regionId: 4,
          codigo: 'CBA',
          poblacion: 3567654,
          area: 165321,
          fechaCreacion: new Date('2024-02-25')
        },
        {
          id: 8,
          nombre: 'Santa Fe',
          regionId: 4,
          codigo: 'SFE',
          poblacion: 3194537,
          area: 133007,
          fechaCreacion: new Date('2024-03-01')
        }
      ];
      
      this.provinciasFiltradas = [...this.provincias];
      this.totalProvincias = this.provincias.length;
      this.cargando = false;
    }, 800);
  }

  // Obtener nombre de región por ID
  obtenerNombreRegion(regionId: number): string {
    const region = this.regiones.find(r => r.id === regionId);
    return region ? region.nombre : 'Región desconocida';
  }

  // Filtrar provincias por texto
  filtrarProvincias(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    this.aplicarFiltros(filtro);
  }

  // Filtrar por región
  filtrarPorRegion(regionId: number): void {
    this.filtroRegion = regionId;
    this.aplicarFiltros('');
  }

  // Aplicar filtros combinados
  private aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.provincias];
    
    // Filtrar por región
    if (this.filtroRegion > 0) {
      resultado = resultado.filter(p => p.regionId === this.filtroRegion);
    }
    
    // Filtrar por texto
    if (filtroTexto) {
      resultado = resultado.filter(provincia =>
        provincia.nombre.toLowerCase().includes(filtroTexto) ||
        provincia.codigo?.toLowerCase().includes(filtroTexto) ||
        this.obtenerNombreRegion(provincia.regionId).toLowerCase().includes(filtroTexto)
      );
    }
    
    this.provinciasFiltradas = resultado;
  }

  // Iniciar nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.provinciaEditando = null;
    this.provinciaForm.reset({
      nombre: '',
      regionId: '',
      codigo: '',
      poblacion: null,
      area: null
    });
    this.provinciaForm.markAsPristine();
    this.provinciaForm.markAsUntouched();
  }

  // Editar provincia existente
  editarProvincia(provincia: Provincia): void {
    this.modoEdicion = true;
    this.provinciaEditando = provincia;
    
    this.provinciaForm.patchValue({
      nombre: provincia.nombre,
      regionId: provincia.regionId,
      codigo: provincia.codigo || '',
      poblacion: provincia.poblacion || null,
      area: provincia.area || null
    });
    
    // Scroll suave al formulario
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Guardar provincia
  guardarProvincia(): void {
    // Marcar todos los controles como touched
    Object.keys(this.provinciaForm.controls).forEach(key => {
      const control = this.provinciaForm.get(key);
      control?.markAsTouched();
    });

    if (this.provinciaForm.invalid) {
      // Encontrar el primer campo inválido y enfocarlo
      for (const key of Object.keys(this.provinciaForm.controls)) {
        const control = this.provinciaForm.get(key);
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
    
    const provinciaData = this.provinciaForm.value;
    
    // Simulación de guardado
    setTimeout(() => {
      if (this.modoEdicion && this.provinciaEditando) {
        // Actualizar provincia existente
        const index = this.provincias.findIndex(p => p.id === this.provinciaEditando!.id);
        if (index !== -1) {
          this.provincias[index] = {
            ...this.provinciaEditando,
            nombre: provinciaData.nombre,
            regionId: provinciaData.regionId,
            codigo: provinciaData.codigo || undefined,
            poblacion: provinciaData.poblacion || undefined,
            area: provinciaData.area || undefined
          };
        }
      } else {
        // Crear nueva provincia
        const nuevaProvincia: Provincia = {
          id: this.provincias.length > 0 ? Math.max(...this.provincias.map(p => p.id)) + 1 : 1,
          nombre: provinciaData.nombre,
          regionId: provinciaData.regionId,
          codigo: provinciaData.codigo || undefined,
          poblacion: provinciaData.poblacion || undefined,
          area: provinciaData.area || undefined,
          fechaCreacion: new Date()
        };
        this.provincias.unshift(nuevaProvincia);
        this.totalProvincias = this.provincias.length;
      }
      
      this.aplicarFiltros('');
      this.guardando = false;
      this.nuevoRegistro();
      
      // Mostrar notificación de éxito
      this.mostrarNotificacion('success', 
        this.modoEdicion ? 'Provincia actualizada' : 'Provincia creada',
        `La provincia "${provinciaData.nombre}" se ha guardado correctamente.`
      );
    }, 1200);
  }

  // Cancelar edición
  cancelarEdicion(): void {
    if (this.provinciaForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

  // Ver detalles de provincia
  verDetalles(provincia: Provincia): void {
    const region = this.regiones.find(r => r.id === provincia.regionId);
    const detalles = `
      <strong>${provincia.nombre}</strong>
      <br><br>
      <strong>Región:</strong> ${region?.nombre || 'No especificada'}
      <br>
      <strong>Código:</strong> ${provincia.codigo || 'No especificado'}
      <br>
      <strong>Población:</strong> ${provincia.poblacion ? provincia.poblacion.toLocaleString() + ' hab.' : 'No especificada'}
      <br>
      <strong>Área:</strong> ${provincia.area ? provincia.area.toLocaleString() + ' km²' : 'No especificada'}
      <br>
      <strong>Fecha de creación:</strong> ${provincia.fechaCreacion.toLocaleDateString()}
    `;
    
    // En producción, usarías un servicio de diálogos
    alert(detalles);
  }

  // Eliminar provincia
  eliminarProvincia(provincia: Provincia): void {
    this.provinciaAEliminar = provincia;
    
    // Mostrar modal de confirmación usando Bootstrap
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.provinciaAEliminar) return;
    
    const index = this.provincias.findIndex(p => p.id === this.provinciaAEliminar!.id);
    if (index !== -1) {
      const nombreEliminado = this.provinciaAEliminar.nombre;
      this.provincias.splice(index, 1);
      this.totalProvincias = this.provincias.length;
      this.aplicarFiltros('');
      
      // Cerrar modal
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal.hide();
      }
      
      // Mostrar notificación
      this.mostrarNotificacion('info', 
        'Provincia eliminada',
        `La provincia "${nombreEliminado}" ha sido eliminada correctamente.`
      );
    }
    
    this.provinciaAEliminar = null;
  }

  // Mostrar notificación
  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    // En producción, usarías un servicio de notificaciones
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    // Simulación simple para desarrollo
    const iconos = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    
    alert(`${iconos[tipo]} ${titulo}\n\n${mensaje}`);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.provinciaForm.get(fieldName);
    
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
        return 'Solo se permiten letras y espacios';
      }
      if (fieldName === 'codigo') {
        return 'Solo mayúsculas, entre 2 y 10 caracteres';
      }
      return 'Formato inválido';
    }
    
    return 'Valor inválido';
  }
}