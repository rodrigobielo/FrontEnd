import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Hotel {
  id: number;
  nombre: string;
}

interface Imagen {
  id: number;
  url: string;
  hotelId: number;
  hotelNombre?: string;
}

@Component({
  selector: 'app-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.css']
})
export class ImagenesComponent implements OnInit {
  @Input() hotelId: number | undefined;
  
  imagenes: Imagen[] = [];
  hoteles: Hotel[] = []; // Agregar esta propiedad
  imagenSeleccionada: Imagen | null = null;
  nuevaImagen: Imagen = {
    id: 0,
    url: '',
    hotelId: 0
  };
  modoEdicion: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.cargarHoteles(); // Cargar hoteles primero
    this.cargarImagenes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotelId'] && this.hotelId) {
      console.log('Hotel ID recibido:', this.hotelId);
      this.cargarImagenes();
    }
  }

  cargarHoteles(): void {
    // Aquí iría la llamada al servicio para obtener los hoteles
    // Datos de ejemplo:
    this.hoteles = [
      { id: 1, nombre: 'Hotel Paraíso' },
      { id: 2, nombre: 'Hotel Playa' },
      { id: 3, nombre: 'Hotel Montaña' }
    ];
  }

  cargarImagenes(): void {
    // Aquí iría la llamada al servicio para obtener las imágenes por hotelId
    console.log('Cargando imágenes para hotel:', this.hotelId);
    
    // Datos de ejemplo filtrados por hotel
    if (this.hotelId === 1) {
      this.imagenes = [
        { id: 1, url: 'https://picsum.photos/200/150?random=1', hotelId: 1, hotelNombre: 'Hotel Paraíso' },
        { id: 2, url: 'https://picsum.photos/200/150?random=2', hotelId: 1, hotelNombre: 'Hotel Paraíso' }
      ];
    } else if (this.hotelId === 2) {
      this.imagenes = [
        { id: 3, url: 'https://picsum.photos/200/150?random=3', hotelId: 2, hotelNombre: 'Hotel Playa' },
        { id: 4, url: 'https://picsum.photos/200/150?random=4', hotelId: 2, hotelNombre: 'Hotel Playa' }
      ];
    } else {
      this.imagenes = [
        { id: 1, url: 'https://picsum.photos/200/150?random=1', hotelId: 1, hotelNombre: 'Hotel Paraíso' },
        { id: 2, url: 'https://picsum.photos/200/150?random=2', hotelId: 1, hotelNombre: 'Hotel Paraíso' },
        { id: 3, url: 'https://picsum.photos/200/150?random=3', hotelId: 2, hotelNombre: 'Hotel Playa' },
        { id: 4, url: 'https://picsum.photos/200/150?random=4', hotelId: 2, hotelNombre: 'Hotel Playa' }
      ];
    }
  }

  guardarImagen(): void {
    if (!this.nuevaImagen.url) {
      alert('Por favor ingrese una URL de imagen');
      return;
    }

    if (this.modoEdicion && this.imagenSeleccionada) {
      // Actualizar imagen existente
      const index = this.imagenes.findIndex(i => i.id === this.imagenSeleccionada?.id);
      if (index !== -1) {
        this.imagenes[index] = { ...this.nuevaImagen };
        this.imagenes[index].hotelNombre = this.obtenerNombreHotel(this.nuevaImagen.hotelId);
      }
    } else {
      // Crear nueva imagen
      const nuevaId = this.imagenes.length > 0 ? Math.max(...this.imagenes.map(i => i.id)) + 1 : 1;
      const imagenParaGuardar: Imagen = {
        ...this.nuevaImagen,
        id: nuevaId,
        hotelId: this.hotelId || this.nuevaImagen.hotelId,
        hotelNombre: this.obtenerNombreHotel(this.nuevaImagen.hotelId)
      };
      this.imagenes.push(imagenParaGuardar);
    }
    
    this.resetearFormulario();
    alert('Imagen guardada correctamente');
  }

  editarImagen(imagen: Imagen): void {
    this.modoEdicion = true;
    this.imagenSeleccionada = imagen;
    this.nuevaImagen = { ...imagen };
  }

  eliminarImagen(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      this.imagenes = this.imagenes.filter(imagen => imagen.id !== id);
      if (this.imagenSeleccionada?.id === id) {
        this.resetearFormulario();
      }
      alert('Imagen eliminada correctamente');
    }
  }

  cancelarEdicion(): void { // Método faltante
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevaImagen = {
      id: 0,
      url: '',
      hotelId: this.hotelId || 0
    };
    this.modoEdicion = false;
    this.imagenSeleccionada = null;
  }

  obtenerNombreHotel(hotelId: number): string {
    const hotel = this.hoteles.find(h => h.id === hotelId);
    return hotel ? hotel.nombre : 'Hotel no especificado';
  }

  recargarDatos(): void {
    this.cargarImagenes();
    this.resetearFormulario();
  }
}