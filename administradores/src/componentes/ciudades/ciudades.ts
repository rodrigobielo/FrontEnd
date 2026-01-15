import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Provincia {
  id: number;
  nombre: string;
  regionId: number;
  codigo?: string;
  poblacion?: number;
  area?: number;
}

interface Ciudad {
  id: number;
  nombre: string;
  descripcion: string;
  provinciaId: number;
  codigoPostal?: string;
  poblacion?: number;
  altitud?: number;
  fundacion?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css']
})
export class Ciudades implements OnInit, OnDestroy {
  // Formulario reactivo
  ciudadForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  filtroProvincia: number = 0;
  
  // Datos
  provincias: Provincia[] = [];
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  ciudadEditando: Ciudad | null = null;
  ciudadDetalles: Ciudad | null = null;
  ciudadAEliminar: Ciudad | null = null;
  
  // Estadísticas
  totalCiudades: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(private fb: FormBuilder) {
    this.ciudadForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
      ]],
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      provinciaId: ['', [Validators.required, Validators.min(1)]],
      codigoPostal: ['', [
        Validators.pattern(/^\d{4,10}$/)
      ]],
      poblacion: [null, [
        Validators.min(0),
        Validators.max(10000000)
      ]],
      altitud: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      fundacion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarProvincias();
    this.cargarCiudades();
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
  }

  // Inicializar modales de Bootstrap
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

  // Destruir instancias de modales
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

  // Cargar provincias (simulación de servicio)
  cargarProvincias(): void {
    // Datos de ejemplo para provincias
    this.provincias = [
      {
        id: 1,
        nombre: 'Jujuy',
        regionId: 2,
        codigo: 'JUJ',
        poblacion: 673307,
        area: 53219
      },
      {
        id: 2,
        nombre: 'Salta',
        regionId: 2,
        codigo: 'SAL',
        poblacion: 1333000,
        area: 155488
      },
      {
        id: 3,
        nombre: 'Mendoza',
        regionId: 2,
        codigo: 'MEN',
        poblacion: 1990000,
        area: 148827
      },
      {
        id: 4,
        nombre: 'Buenos Aires',
        regionId: 4,
        codigo: 'BA',
        poblacion: 17541141,
        area: 307571
      },
      {
        id: 5,
        nombre: 'Córdoba',
        regionId: 4,
        codigo: 'CBA',
        poblacion: 3567654,
        area: 165321
      },
      {
        id: 6,
        nombre: 'Santa Fe',
        regionId: 4,
        codigo: 'SFE',
        poblacion: 3194537,
        area: 133007
      }
    ];
  }

  // Cargar ciudades (simulación de API)
  cargarCiudades(): void {
    this.cargando = true;
    
    // Simulación de carga de datos
    setTimeout(() => {
      this.ciudades = [
        {
          id: 1,
          nombre: 'San Salvador de Jujuy',
          descripcion: 'Capital de la provincia de Jujuy, conocida por su arquitectura colonial y su ubicación en el valle de los ríos Grande y Xibi Xibi.',
          provinciaId: 1,
          codigoPostal: '4600',
          poblacion: 265249,
          altitud: 1259,
          fundacion: '1593-04-19',
          fechaCreacion: new Date('2024-01-10')
        },
        {
          id: 2,
          nombre: 'Salta Capital',
          descripcion: 'Ciudad ubicada en el Valle de Lerma, famosa por su arquitectura colonial española y su rica historia cultural.',
          provinciaId: 2,
          codigoPostal: '4400',
          poblacion: 535303,
          altitud: 1152,
          fundacion: '1582-04-16',
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 3,
          nombre: 'Mendoza',
          descripcion: 'Principal ciudad de la región de Cuyo, famosa por su producción vitivinícola y sus paisajes montañosos.',
          provinciaId: 3,
          codigoPostal: '5500',
          poblacion: 115041,
          altitud: 746,
          fundacion: '1561-03-02',
          fechaCreacion: new Date('2024-01-20')
        },
        {
          id: 4,
          nombre: 'Buenos Aires',
          descripcion: 'Capital federal de Argentina, centro cultural, económico y político del país, ubicada en la costa del Río de la Plata.',
          provinciaId: 4,
          codigoPostal: 'C1000',
          poblacion: 2890151,
          altitud: 25,
          fundacion: '1536-02-02',
          fechaCreacion: new Date('2024-01-25')
        },
        {
          id: 5,
          nombre: 'Córdoba',
          descripcion: 'Segunda ciudad más poblada de Argentina, conocida por su arquitectura colonial y su importante vida universitaria.',
          provinciaId: 5,
          codigoPostal: '5000',
          poblacion: 1317298,
          altitud: 390,
          fundacion: '1573-07-06',
          fechaCreacion: new Date('2024-01-30')
        },
        {
          id: 6,
          nombre: 'Rosario',
          descripcion: 'Importante ciudad portuaria ubicada en la provincia de Santa Fe, conocida por su arquitectura moderna y su actividad industrial.',
          provinciaId: 6,
          codigoPostal: '2000',
          poblacion: 948312,
          altitud: 22,
          fundacion: '1852-08-05',
          fechaCreacion: new Date('2024-02-05')
        },
        {
          id: 7,
          nombre: 'San Miguel de Tucumán',
          descripcion: 'Capital de la provincia de Tucumán, conocida como el Jardín de la República por su vegetación exuberante.',
          provinciaId: 2,
          codigoPostal: '4000',
          poblacion: 527607,
          altitud: 431,
          fundacion: '1565-05-31',
          fechaCreacion: new Date('2024-02-10')
        }
      ];
      
      this.ciudadesFiltradas = [...this.ciudades];
      this.totalCiudades = this.ciudades.length;
      this.cargando = false;
    }, 800);
  }

  // Obtener nombre de provincia por ID
  obtenerNombreProvincia(provinciaId: number): string {
    const provincia = this.provincias.find(p => p.id === provinciaId);
    return provincia ? provincia.nombre : 'Provincia desconocida';
  }

  // Filtrar ciudades por texto
  filtrarCiudades(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    this.aplicarFiltros(filtro);
  }

  // Filtrar por provincia
  filtrarPorProvincia(provinciaId: number): void {
    this.filtroProvincia = provinciaId;
    this.aplicarFiltros('');
  }

  // Aplicar filtros combinados
  private aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.ciudades];
    
    // Filtrar por provincia
    if (this.filtroProvincia > 0) {
      resultado = resultado.filter(c => c.provinciaId === this.filtroProvincia);
    }
    
    // Filtrar por texto
    if (filtroTexto) {
      resultado = resultado.filter(ciudad =>
        ciudad.nombre.toLowerCase().includes(filtroTexto) ||
        ciudad.descripcion.toLowerCase().includes(filtroTexto) ||
        ciudad.codigoPostal?.toLowerCase().includes(filtroTexto) ||
        this.obtenerNombreProvincia(ciudad.provinciaId).toLowerCase().includes(filtroTexto)
      );
    }
    
    this.ciudadesFiltradas = resultado;
  }

  // Iniciar nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.ciudadEditando = null;
    this.ciudadForm.reset({
      nombre: '',
      descripcion: '',
      provinciaId: '',
      codigoPostal: '',
      poblacion: null,
      altitud: null,
      fundacion: ''
    });
    this.ciudadForm.markAsPristine();
    this.ciudadForm.markAsUntouched();
  }

  // Editar ciudad existente
  editarCiudad(ciudad: Ciudad): void {
    this.modoEdicion = true;
    this.ciudadEditando = ciudad;
    
    this.ciudadForm.patchValue({
      nombre: ciudad.nombre,
      descripcion: ciudad.descripcion,
      provinciaId: ciudad.provinciaId,
      codigoPostal: ciudad.codigoPostal || '',
      poblacion: ciudad.poblacion || null,
      altitud: ciudad.altitud || null,
      fundacion: ciudad.fundacion || ''
    });
    
    // Scroll suave al formulario
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Guardar ciudad
  guardarCiudad(): void {
    // Marcar todos los controles como touched
    Object.keys(this.ciudadForm.controls).forEach(key => {
      const control = this.ciudadForm.get(key);
      control?.markAsTouched();
    });

    if (this.ciudadForm.invalid) {
      // Encontrar el primer campo inválido y enfocarlo
      for (const key of Object.keys(this.ciudadForm.controls)) {
        const control = this.ciudadForm.get(key);
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
    
    const ciudadData = this.ciudadForm.value;
    
    // Simulación de guardado
    setTimeout(() => {
      if (this.modoEdicion && this.ciudadEditando) {
        // Actualizar ciudad existente
        const index = this.ciudades.findIndex(c => c.id === this.ciudadEditando!.id);
        if (index !== -1) {
          this.ciudades[index] = {
            ...this.ciudadEditando,
            nombre: ciudadData.nombre,
            descripcion: ciudadData.descripcion,
            provinciaId: ciudadData.provinciaId,
            codigoPostal: ciudadData.codigoPostal || undefined,
            poblacion: ciudadData.poblacion || undefined,
            altitud: ciudadData.altitud || undefined,
            fundacion: ciudadData.fundacion || undefined
          };
        }
      } else {
        // Crear nueva ciudad
        const nuevaCiudad: Ciudad = {
          id: this.ciudades.length > 0 ? Math.max(...this.ciudades.map(c => c.id)) + 1 : 1,
          nombre: ciudadData.nombre,
          descripcion: ciudadData.descripcion,
          provinciaId: ciudadData.provinciaId,
          codigoPostal: ciudadData.codigoPostal || undefined,
          poblacion: ciudadData.poblacion || undefined,
          altitud: ciudadData.altitud || undefined,
          fundacion: ciudadData.fundacion || undefined,
          fechaCreacion: new Date()
        };
        this.ciudades.unshift(nuevaCiudad);
        this.totalCiudades = this.ciudades.length;
      }
      
      this.aplicarFiltros('');
      this.guardando = false;
      this.nuevoRegistro();
      
      // Mostrar notificación de éxito
      this.mostrarNotificacion('success', 
        this.modoEdicion ? 'Ciudad actualizada' : 'Ciudad creada',
        `La ciudad "${ciudadData.nombre}" se ha guardado correctamente.`
      );
    }, 1200);
  }

  // Cancelar edición
  cancelarEdicion(): void {
    if (this.ciudadForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

  // Ver detalles de ciudad
  verDetalles(ciudad: Ciudad): void {
    this.ciudadDetalles = ciudad;
    
    // Mostrar modal de detalles
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar ciudad
  eliminarCiudad(ciudad: Ciudad): void {
    this.ciudadAEliminar = ciudad;
    
    // Mostrar modal de confirmación
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.ciudadAEliminar) return;
    
    const index = this.ciudades.findIndex(c => c.id === this.ciudadAEliminar!.id);
    if (index !== -1) {
      const nombreEliminado = this.ciudadAEliminar.nombre;
      this.ciudades.splice(index, 1);
      this.totalCiudades = this.ciudades.length;
      this.aplicarFiltros('');
      
      // Cerrar modal
      if (this.confirmarModalInstance) {
        this.confirmarModalInstance.hide();
      }
      
      // Mostrar notificación
      this.mostrarNotificacion('info', 
        'Ciudad eliminada',
        `La ciudad "${nombreEliminado}" ha sido eliminada correctamente.`
      );
    }
    
    this.ciudadAEliminar = null;
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
    const control = this.ciudadForm.get(fieldName);
    
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
        return 'Solo letras, espacios, puntos y guiones';
      }
      if (fieldName === 'codigoPostal') {
        return 'Solo números, entre 4 y 10 dígitos';
      }
      return 'Formato inválido';
    }
    
    return 'Valor inválido';
  }

  // Obtener provincia por ID
  getProvinciaById(id: number): Provincia | undefined {
    return this.provincias.find(p => p.id === id);
  }
}
