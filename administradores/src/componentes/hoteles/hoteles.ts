import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Ciudad {
  id: number;
  nombre: string;
  provinciaId: number;
  descripcion: string;
  codigoPostal?: string;
}

interface Hotel {
  id: number;
  nombre: string;
  descripcion: string;
  contactos: string;
  ciudadId: number;
  categoria: string;
  habitaciones?: number;
  precioPromedio?: number;
  imagenPrincipal?: string;
  imagenSecundaria?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hoteles.html',
  styleUrls: ['./hoteles.css']
})
export class Hoteles implements OnInit, OnDestroy, AfterViewInit {
  // Formulario reactivo
  hotelForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  filtroCategoria: string = '';
  filtroTexto: string = '';
  
  // Datos
  ciudades: Ciudad[] = [];
  hoteles: Hotel[] = [];
  hotelesFiltrados: Hotel[] = [];
  hotelEditando: Hotel | null = null;
  hotelDetalles: Hotel | null = null;
  hotelAEliminar: Hotel | null = null;
  
  // Categorías predefinidas
  categorias = [
    { value: '1', label: '1 Estrella' },
    { value: '2', label: '2 Estrellas' },
    { value: '3', label: '3 Estrellas' },
    { value: '4', label: '4 Estrellas' },
    { value: '5', label: '5 Estrellas' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'apart', label: 'Apart Hotel' },
    { value: 'hostel', label: 'Hostel' }
  ];
  
  // Estadísticas
  totalHoteles: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor(private fb: FormBuilder) {
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
      ciudadId: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      habitaciones: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      precioPromedio: [null, [
        Validators.min(0),
        Validators.max(10000)
      ]],
      imagenPrincipal: ['', [
        Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i)
      ]],
      imagenSecundaria: ['', [
        Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i)
      ]]
    });

    // Suscripción para filtrado en tiempo real
    this.hotelForm.get('nombre')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarHoteles();
  }

  ngAfterViewInit(): void {
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
  }

  // Inicializar modales de Bootstrap
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

  // Cargar ciudades (simulación de servicio)
  cargarCiudades(): void {
    // Datos de ejemplo para ciudades
    this.ciudades = [
      {
        id: 1,
        nombre: 'San Salvador de Jujuy',
        provinciaId: 1,
        descripcion: 'Capital de la provincia de Jujuy',
        codigoPostal: '4600'
      },
      {
        id: 2,
        nombre: 'Salta Capital',
        provinciaId: 2,
        descripcion: 'Ciudad ubicada en el Valle de Lerma',
        codigoPostal: '4400'
      },
      {
        id: 3,
        nombre: 'Mendoza',
        provinciaId: 3,
        descripcion: 'Principal ciudad de la región de Cuyo',
        codigoPostal: '5500'
      },
      {
        id: 4,
        nombre: 'Buenos Aires',
        provinciaId: 4,
        descripcion: 'Capital federal de Argentina',
        codigoPostal: 'C1000'
      },
      {
        id: 5,
        nombre: 'Córdoba',
        provinciaId: 5,
        descripcion: 'Segunda ciudad más poblada de Argentina',
        codigoPostal: '5000'
      },
      {
        id: 6,
        nombre: 'Rosario',
        provinciaId: 6,
        descripcion: 'Importante ciudad portuaria',
        codigoPostal: '2000'
      },
      {
        id: 7,
        nombre: 'Bariloche',
        provinciaId: 7,
        descripcion: 'Ciudad turística en la Patagonia',
        codigoPostal: '8400'
      }
    ];
  }

  // Cargar hoteles (simulación de API)
  cargarHoteles(): void {
    this.cargando = true;
    
    // Simulación de carga de datos
    setTimeout(() => {
      this.hoteles = [
        {
          id: 1,
          nombre: 'Hotel de la Montaña',
          descripcion: 'Hotel boutique con vista panorámica a la montaña, ubicado en el centro histórico. Ofrece spa, restaurante gourmet y habitaciones con jacuzzi.',
          contactos: 'Tel: +54 388 123-4567\nEmail: info@hoteldelamontana.com\nDirección: Av. Belgrano 1234',
          ciudadId: 1,
          categoria: 'boutique',
          habitaciones: 45,
          precioPromedio: 180,
          imagenPrincipal: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          imagenSecundaria: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Gran Hotel Salta',
          descripcion: 'Hotel 5 estrellas con piscina cubierta, centro de convenciones y 3 restaurantes. Ideal para negocios y turismo.',
          contactos: 'Tel: +54 387 987-6543\nEmail: reservas@granhotelsalta.com\nDirección: Calle Alvarado 567',
          ciudadId: 2,
          categoria: '5',
          habitaciones: 120,
          precioPromedio: 220,
          imagenPrincipal: 'https://images.unsplash.com/photo-1564501049418-3c27787d01e8?w=800',
          fechaCreacion: new Date('2024-01-20')
        },
        {
          id: 3,
          nombre: 'Vineyard Resort',
          descripcion: 'Resort en medio de viñedos con degustaciones de vino incluídas. Ofrece tours en bicicleta y masajes.',
          contactos: 'Tel: +54 261 456-7890\nEmail: contacto@vineyardresort.com\nDirección: Ruta 40 km 123',
          ciudadId: 3,
          categoria: '4',
          habitaciones: 80,
          precioPromedio: 150,
          imagenPrincipal: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          fechaCreacion: new Date('2024-01-25')
        },
        {
          id: 4,
          nombre: 'Urban Hostel Buenos Aires',
          descripcion: 'Hostel moderno en Palermo con cocina compartida, sala de juegos y tours gratuitos por la ciudad.',
          contactos: 'Tel: +54 11 8765-4321\nEmail: book@urbanhostel.com\nDirección: Thames 2345',
          ciudadId: 4,
          categoria: 'hostel',
          habitaciones: 25,
          precioPromedio: 35,
          imagenPrincipal: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          fechaCreacion: new Date('2024-02-01')
        },
        {
          id: 5,
          nombre: 'Apart Hotel Córdoba Center',
          descripcion: 'Apart hotel con cocina completa en cada unidad, lavandería y servicio de limpieza diario.',
          contactos: 'Tel: +54 351 234-5678\nEmail: info@cordobacenter.com\nDirección: Av. Colón 789',
          ciudadId: 5,
          categoria: 'apart',
          habitaciones: 60,
          precioPromedio: 85,
          fechaCreacion: new Date('2024-02-05')
        },
        {
          id: 6,
          nombre: 'Hotel Las Vegas Rosario',
          descripcion: 'Hotel 3 estrellas con desayuno buffet incluido, ubicado frente al río Paraná.',
          contactos: 'Tel: +54 341 345-6789\nEmail: reservas@hotellasvegas.com\nDirección: Blvd. Oroño 432',
          ciudadId: 6,
          categoria: '3',
          habitaciones: 75,
          precioPromedio: 95,
          imagenPrincipal: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          fechaCreacion: new Date('2024-02-10')
        },
        {
          id: 7,
          nombre: 'Hotel Patagonia Lodge',
          descripcion: 'Lodge de montaña con actividades al aire libre incluidas: trekking, cabalgatas y pesca.',
          contactos: 'Tel: +54 294 123-4567\nEmail: adventure@patagonialodge.com\nDirección: Circuito Chico km 12',
          ciudadId: 7,
          categoria: '4',
          habitaciones: 40,
          precioPromedio: 200,
          imagenPrincipal: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
          fechaCreacion: new Date('2024-02-15')
        }
      ];
      
      this.hotelesFiltrados = [...this.hoteles];
      this.totalHoteles = this.hoteles.length;
      this.cargando = false;
    }, 800);
  }

  // Obtener nombre de ciudad por ID
  obtenerNombreCiudad(ciudadId: number): string {
    const ciudad = this.ciudades.find(c => c.id === ciudadId);
    return ciudad ? ciudad.nombre : 'Ciudad desconocida';
  }

  // Obtener label de categoría
  getCategoriaLabel(categoria: string): string {
    const cat = this.categorias.find(c => c.value === categoria);
    return cat ? cat.label : 'Sin categoría';
  }

  // Obtener clase para badge de categoría
  getCategoriaBadgeClass(categoria: string): string {
    const classes: {[key: string]: string} = {
      '1': 'badge text-bg-secondary',
      '2': 'badge text-bg-secondary',
      '3': 'badge text-bg-primary',
      '4': 'badge text-bg-info',
      '5': 'badge text-bg-warning',
      'boutique': 'badge text-bg-purple',
      'apart': 'badge text-bg-success',
      'hostel': 'badge text-bg-light text-dark'
    };
    return classes[categoria] || 'badge text-bg-secondary';
  }

  // Filtrar hoteles por texto
  filtrarHoteles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  // Filtrar por categoría
  filtrarPorCategoria(categoria: string): void {
    this.filtroCategoria = categoria;
    this.aplicarFiltros();
  }

  // Aplicar filtros combinados
  private aplicarFiltros(): void {
    let resultado = [...this.hoteles];
    
    // Filtrar por categoría
    if (this.filtroCategoria) {
      resultado = resultado.filter(h => h.categoria === this.filtroCategoria);
    }
    
    // Filtrar por texto
    if (this.filtroTexto) {
      resultado = resultado.filter(hotel =>
        hotel.nombre.toLowerCase().includes(this.filtroTexto) ||
        hotel.descripcion.toLowerCase().includes(this.filtroTexto) ||
        hotel.contactos.toLowerCase().includes(this.filtroTexto) ||
        this.obtenerNombreCiudad(hotel.ciudadId).toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.hotelesFiltrados = resultado;
  }

  // Iniciar nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.hotelEditando = null;
    this.hotelForm.reset({
      nombre: '',
      descripcion: '',
      contactos: '',
      ciudadId: '',
      categoria: '',
      habitaciones: null,
      precioPromedio: null,
      imagenPrincipal: '',
      imagenSecundaria: ''
    });
    this.hotelForm.markAsPristine();
    this.hotelForm.markAsUntouched();
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.col-lg-5');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Editar hotel existente
  editarHotel(hotel: Hotel): void {
    this.modoEdicion = true;
    this.hotelEditando = hotel;
    
    this.hotelForm.patchValue({
      nombre: hotel.nombre,
      descripcion: hotel.descripcion,
      contactos: hotel.contactos,
      ciudadId: hotel.ciudadId.toString(),
      categoria: hotel.categoria,
      habitaciones: hotel.habitaciones || null,
      precioPromedio: hotel.precioPromedio || null,
      imagenPrincipal: hotel.imagenPrincipal || '',
      imagenSecundaria: hotel.imagenSecundaria || ''
    });
    
    // Scroll suave al formulario
    setTimeout(() => {
      const formulario = document.querySelector('.col-lg-5');
      if (formulario) {
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Guardar hotel
  guardarHotel(): void {
    // Marcar todos los controles como touched
    Object.keys(this.hotelForm.controls).forEach(key => {
      const control = this.hotelForm.get(key);
      control?.markAsTouched();
    });

    if (this.hotelForm.invalid) {
      // Encontrar el primer campo inválido y enfocarlo
      for (const key of Object.keys(this.hotelForm.controls)) {
        const control = this.hotelForm.get(key);
        if (control?.invalid) {
          const element = document.getElementById(key);
          if (element) {
            element.focus();
          }
          break;
        }
      }
      
      // Mostrar alerta de error
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      return;
    }

    this.guardando = true;
    
    const hotelData = this.hotelForm.value;
    hotelData.ciudadId = Number(hotelData.ciudadId);
    
    // Simulación de guardado
    setTimeout(() => {
      if (this.modoEdicion && this.hotelEditando) {
        // Actualizar hotel existente
        const index = this.hoteles.findIndex(h => h.id === this.hotelEditando!.id);
        if (index !== -1) {
          this.hoteles[index] = {
            ...this.hotelEditando,
            nombre: hotelData.nombre,
            descripcion: hotelData.descripcion,
            contactos: hotelData.contactos,
            ciudadId: hotelData.ciudadId,
            categoria: hotelData.categoria,
            habitaciones: hotelData.habitaciones || undefined,
            precioPromedio: hotelData.precioPromedio || undefined,
            imagenPrincipal: hotelData.imagenPrincipal || undefined,
            imagenSecundaria: hotelData.imagenSecundaria || undefined
          };
        }
      } else {
        // Crear nuevo hotel
        const nuevoHotel: Hotel = {
          id: this.hoteles.length > 0 ? Math.max(...this.hoteles.map(h => h.id)) + 1 : 1,
          nombre: hotelData.nombre,
          descripcion: hotelData.descripcion,
          contactos: hotelData.contactos,
          ciudadId: hotelData.ciudadId,
          categoria: hotelData.categoria,
          habitaciones: hotelData.habitaciones || undefined,
          precioPromedio: hotelData.precioPromedio || undefined,
          imagenPrincipal: hotelData.imagenPrincipal || undefined,
          imagenSecundaria: hotelData.imagenSecundaria || undefined,
          fechaCreacion: new Date()
        };
        this.hoteles.unshift(nuevoHotel);
        this.totalHoteles = this.hoteles.length;
      }
      
      this.aplicarFiltros();
      this.guardando = false;
      this.nuevoRegistro();
      
      // Mostrar notificación de éxito
      this.mostrarNotificacion('success', 
        this.modoEdicion ? 'Hotel actualizado' : 'Hotel creado',
        `El hotel "${hotelData.nombre}" se ha guardado correctamente.`
      );
    }, 1200);
  }

  // Cancelar edición
  cancelarEdicion(): void {
    if (this.hotelForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

  // Ver detalles de hotel
  verDetalles(hotel: Hotel): void {
    this.hotelDetalles = hotel;
    
    // Mostrar modal de detalles
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  // Eliminar hotel
  eliminarHotel(hotel: Hotel): void {
    this.hotelAEliminar = hotel;
    
    // Mostrar modal de confirmación
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  // Confirmar eliminación
  confirmarEliminar(): void {
    if (!this.hotelAEliminar) return;
    
    const index = this.hoteles.findIndex(h => h.id === this.hotelAEliminar!.id);
    if (index !== -1) {
      const nombreEliminado = this.hotelAEliminar.nombre;
      this.hoteles.splice(index, 1);
      this.totalHoteles = this.hoteles.length;
      this.aplicarFiltros();
      
      // Cerrar modal
      if (this.confirmarModalInstance) {
        this.confirmarModalInstance.hide();
      }
      
      // Mostrar notificación
      this.mostrarNotificacion('info', 
        'Hotel eliminado',
        `El hotel "${nombreEliminado}" ha sido eliminado correctamente.`
      );
    }
    
    this.hotelAEliminar = null;
  }

  // Manejo de errores en imágenes
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSI+SW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
  }

  // Vista previa de imagen
  previewImagen(tipo: 'principal' | 'secundaria'): void {
    const url = tipo === 'principal' 
      ? this.hotelForm.get('imagenPrincipal')?.value
      : this.hotelForm.get('imagenSecundaria')?.value;
    
    if (url) {
      window.open(url, '_blank');
    } else {
      this.mostrarNotificacion('warning', 
        'Sin imagen', 
        `No hay una URL de imagen ${tipo} para previsualizar.`
      );
    }
  }

  // Manejo de selección de archivos
  onFileSelected(event: Event, tipo: 'principal' | 'secundaria'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.mostrarNotificacion('error', 
          'Tipo de archivo inválido', 
          'Solo se permiten imágenes (JPEG, PNG, GIF, WebP).'
        );
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarNotificacion('error', 
          'Archivo demasiado grande', 
          'La imagen no debe superar los 5MB.'
        );
        return;
      }
      
      // Simulación de subida de archivo
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // En producción, aquí subirías la imagen al servidor
        const fakeUrl = `https://fakeimg.pl/600x400/?text=Hotel+${tipo}+Image`;
        
        if (tipo === 'principal') {
          this.hotelForm.patchValue({ imagenPrincipal: fakeUrl });
        } else {
          this.hotelForm.patchValue({ imagenSecundaria: fakeUrl });
        }
        
        this.mostrarNotificacion('success', 
          'Imagen cargada', 
          `Imagen ${tipo} cargada correctamente. (Simulación)`
        );
      };
      reader.readAsDataURL(file);
    }
  }

  // Mostrar notificación
  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    // En producción, usarías un servicio de notificaciones como ngx-toastr
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    // Crear notificación visual simple
    const toastId = 'hotel-notification-' + Date.now();
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
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    const container = document.querySelector('.toast-container');
    if (!container) {
      const newContainer = document.createElement('div');
      newContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      newContainer.style.zIndex = '1055';
      document.body.appendChild(newContainer);
      newContainer.appendChild(toast);
    } else {
      container.appendChild(toast);
    }
    
    // Inicializar y mostrar toast
    const bsToast = new (window as any).bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover después de cerrar
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const control = this.hotelForm.get(fieldName);
    
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
      if (fieldName.includes('imagen')) {
        return 'URL de imagen inválida (debe terminar en .png, .jpg, .jpeg, .gif, .webp o .svg)';
      }
      return 'Formato inválido';
    }
    
    return 'Valor inválido';
  }
}