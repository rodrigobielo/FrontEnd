import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Hotel {
  id: number;
  nombre: string;
  ubicacion: string;
  distancia: string;
  precio: number;
  precioOriginal?: number;
  descuento?: number;
  calificacion: number;
  estrellas: number;
  imagen: string;
  caracteristicas: string[];
  serviciosIncluidos: string[];
  favorito: boolean;
  ubicacionCategoria: string;
}

@Component({
  selector: 'app-hoteles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hoteles.html'
})
export class Hoteles implements OnInit { // Implementas OnInit aquí
  // Variables de búsqueda y filtros
  searchTerm: string = '';
  filtroUbicacion: string = 'todas';
  filtroEstrellas: number = 0;
  ordenActual: string = 'precio';
  
  // Paginación
  paginaActual: number = 1;
  hotelesPorPagina: number = 3;
  totalPaginas: number = 1;
  
  // Lista completa de hoteles
  hoteles: Hotel[] = [
    {
      id: 1,
      nombre: 'Grand Luxury Hotel & Spa',
      ubicacion: 'Avenida Principal 123, Centro Histórico',
      distancia: 'A 2.5 km del centro',
      precio: 189,
      precioOriginal: 220,
      descuento: 15,
      calificacion: 4.8,
      estrellas: 5,
      imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caracteristicas: ['WiFi Gratis', 'Desayuno Buffet', 'Spa', 'Piscina', 'Restaurante', 'Parking'],
      serviciosIncluidos: ['Check-in 24h', 'Cancelación gratis', 'Limpieza diaria', 'Toallas incluidas'],
      favorito: true,
      ubicacionCategoria: 'centro'
    },
    {
      id: 2,
      nombre: 'Sunset Beach Resort',
      ubicacion: 'Playa del Sol 456, Zona Costera',
      distancia: 'Frente a la playa',
      precio: 245,
      calificacion: 4.5,
      estrellas: 4,
      imagen: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caracteristicas: ['Todo Incluido', 'Playa Privada', 'Piscina Infantil', 'Actividades', 'Bar', 'Animación'],
      serviciosIncluidos: ['Todo incluido', 'Actividades para niños', 'Bebidas ilimitadas', 'Entretenimiento'],
      favorito: false,
      ubicacionCategoria: 'playa'
    },
    {
      id: 3,
      nombre: 'City Business Hotel',
      ubicacion: 'Financial District 789, Zona Comercial',
      distancia: 'A 500m del metro',
      precio: 156,
      calificacion: 4.7,
      estrellas: 4,
      imagen: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caracteristicas: ['WiFi Empresarial', 'Centro de Negocios', 'Room Service', 'Gimnasio', 'Lavandería', 'Reuniones'],
      serviciosIncluidos: ['Early Check-in', 'Late Check-out', 'Cafetería gratuita', 'Periódico diario'],
      favorito: false,
      ubicacionCategoria: 'aeropuerto'
    },
    {
      id: 4,
      nombre: 'Mountain View Lodge',
      ubicacion: 'Carretera Montaña 321, Zona Rural',
      distancia: 'A 10 km del pueblo',
      precio: 120,
      precioOriginal: 150,
      descuento: 20,
      calificacion: 4.6,
      estrellas: 3,
      imagen: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caracteristicas: ['Chimenea', 'Excursiones', 'Desayuno Casero', 'Jardín', 'Terraza', 'Mascotas'],
      serviciosIncluidos: ['Desayuno incluido', 'Estacionamiento gratis', 'Guía turístico', 'Alquiler de bicis'],
      favorito: true,
      ubicacionCategoria: 'centro'
    },
    {
      id: 5,
      nombre: 'Airport Express Inn',
      ubicacion: 'Terminal Aero 654, Zona Aeropuerto',
      distancia: 'A 800m del aeropuerto',
      precio: 98,
      calificacion: 4.2,
      estrellas: 3,
      imagen: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caracteristicas: ['Traslado Aeropuerto', 'Desayuno Temprano', 'Guardaequipaje', 'Recepción 24h', 'Business Center'],
      serviciosIncluidos: ['Traslado gratuito', 'Desayuno continental', 'WiFi rápido', 'Impresión de boarding'],
      favorito: false,
      ubicacionCategoria: 'aeropuerto'
    }
  ];

  // Hoteles filtrados para mostrar
  hotelesFiltrados: Hotel[] = [];

  constructor() { }

  // MÉTODO ngOnInit QUE FALTABA
  ngOnInit(): void {
    // Inicializar los hoteles filtrados con todos los hoteles
    this.hotelesFiltrados = [...this.hoteles];
    this.actualizarPaginacion();
  }

  // Método para aplicar todos los filtros
  aplicarFiltros(): void {
    let hotelesTemp = [...this.hoteles];

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      hotelesTemp = hotelesTemp.filter(hotel =>
        hotel.nombre.toLowerCase().includes(term) ||
        hotel.ubicacion.toLowerCase().includes(term) ||
        hotel.caracteristicas.some(c => c.toLowerCase().includes(term))
      );
    }

    // Filtrar por ubicación
    if (this.filtroUbicacion !== 'todas') {
      hotelesTemp = hotelesTemp.filter(hotel => 
        hotel.ubicacionCategoria === this.filtroUbicacion
      );
    }

    // Filtrar por estrellas
    if (this.filtroEstrellas > 0) {
      hotelesTemp = hotelesTemp.filter(hotel => 
        hotel.estrellas === this.filtroEstrellas
      );
    }

    // Ordenar
    this.ordenarHoteles(hotelesTemp);

    // Actualizar hoteles filtrados
    this.hotelesFiltrados = hotelesTemp;
    
    // Actualizar paginación
    this.actualizarPaginacion();
  }

  // Método para ordenar hoteles
  ordenarHoteles(hoteles: Hotel[]): void {
    const [campo, direccion] = this.ordenActual.startsWith('-') 
      ? [this.ordenActual.substring(1), 'desc'] 
      : [this.ordenActual, 'asc'];

    hoteles.sort((a, b) => {
      let valorA: any = a[campo as keyof Hotel];
      let valorB: any = b[campo as keyof Hotel];

      if (campo === 'precio') {
        valorA = a.precio;
        valorB = b.precio;
      }

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return direccion === 'asc' 
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return direccion === 'asc' 
        ? (valorA < valorB ? -1 : 1)
        : (valorA > valorB ? -1 : 1);
    });
  }

  // Método para cambiar orden
  ordenarPor(criterio: string): void {
    this.ordenActual = criterio;
    this.aplicarFiltros();
  }

  // Método para filtrar por ubicación
  filtrarPorUbicacion(ubicacion: string): void {
    this.filtroUbicacion = ubicacion;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  // Método para filtrar por estrellas
  filtrarPorEstrellas(estrellas: number): void {
    this.filtroEstrellas = estrellas;
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  // Método para buscar hoteles
  buscarHoteles(): void {
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroUbicacion = 'todas';
    this.filtroEstrellas = 0;
    this.ordenActual = 'precio';
    this.paginaActual = 1;
    this.aplicarFiltros();
  }

  // Métodos para reserva y detalles
  reservarHotel(hotel: Hotel): void {
    console.log('Reservando hotel:', hotel.nombre);
    // Aquí normalmente navegarías a una página de reserva
    // o abrirías un modal
    alert(`Iniciando reserva para: ${hotel.nombre}\nPrecio: $${hotel.precio} por noche`);
  }

  verDetalles(hotel: Hotel): void {
    console.log('Viendo detalles del hotel:', hotel);
    alert(`Detalles de ${hotel.nombre}\nUbicación: ${hotel.ubicacion}\nCalificación: ${hotel.calificacion}/5`);
  }

  toggleFavorito(hotel: Hotel): void {
    hotel.favorito = !hotel.favorito;
    console.log(hotel.favorito ? 'Agregado a favoritos' : 'Eliminado de favoritos', hotel.nombre);
  }

  // Métodos auxiliares para UI
  getBadgeClass(calificacion: number): string {
    if (calificacion >= 4.5) return 'bg-success';
    if (calificacion >= 4.0) return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  getIconoCaracteristica(caracteristica: string): string {
    const iconos: { [key: string]: string } = {
      'WiFi': 'bi bi-wifi',
      'WiFi Gratis': 'bi bi-wifi',
      'WiFi Empresarial': 'bi bi-wifi',
      'Desayuno': 'bi bi-cup-hot',
      'Desayuno Buffet': 'bi bi-cup-hot',
      'Desayuno Casero': 'bi bi-house-heart',
      'Desayuno Continental': 'bi bi-cup-hot',
      'Spa': 'bi bi-flower1',
      'Piscina': 'bi bi-water',
      'Piscina Infantil': 'bi bi-water',
      'Restaurante': 'bi bi-egg-fried',
      'Parking': 'bi bi-car-front',
      'Estacionamiento gratis': 'bi bi-p-circle',
      'Todo Incluido': 'bi bi-check-all',
      'Playa Privada': 'bi bi-umbrella',
      'Actividades': 'bi bi-joystick',
      'Bar': 'bi bi-cup-straw',
      'Animación': 'bi bi-music-note-beamed',
      'Centro de Negocios': 'bi bi-briefcase',
      'Room Service': 'bi bi-bell',
      'Gimnasio': 'bi bi-heart-pulse',
      'Lavandería': 'bi bi-bucket',
      'Reuniones': 'bi bi-people',
      'Chimenea': 'bi bi-fire',
      'Excursiones': 'bi bi-signpost-split',
      'Jardín': 'bi bi-flower2',
      'Terraza': 'bi bi-sun',
      'Mascotas': 'bi bi-heart',
      'Traslado Aeropuerto': 'bi bi-airplane',
      'Desayuno Temprano': 'bi bi-alarm',
      'Guardaequipaje': 'bi bi-bag-check',
      'Recepción 24h': 'bi bi-clock'
    };
    
    return iconos[caracteristica] || 'bi bi-check';
  }

  cargarImagenDefault(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  }

  // Métodos de paginación
  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.hotelesFiltrados.length / this.hotelesPorPagina);
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = 1;
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }
}