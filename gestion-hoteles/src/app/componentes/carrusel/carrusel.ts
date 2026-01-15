import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Hotel {
  id: number;
  name: string;
  stars: number;
  city: string;
  province: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Carrusel en pantalla completa -->
    <div class="position-relative w-100 vh-100 overflow-hidden">
      
      <!-- Contenedor principal de la imagen -->
      <div class="position-absolute top-0 start-0 w-100 h-100">
        
        <!-- Imagen actual con animación de fade-in -->
        <img 
          [src]="currentHotel.image" 
          [alt]="currentHotel.name"
          class="w-100 h-100 object-fit-cover fade-in-image image-position"
          [class.d-none]="isLoading">
        
        <!-- Spinner de carga -->
        @if (isLoading) {
          <div class="position-absolute top-50 start-50 translate-middle z-3">
            <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
        }
        
        <!-- Overlay para mejor legibilidad del texto -->
        <div class="position-absolute top-0 start-0 w-100 h-100"
             style="background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 30%, transparent 60%);">
        </div>
      </div>
      
      <!-- Información del hotel - Parte inferior izquierda -->
      <div class="position-absolute bottom-0 start-0 text-white p-4 p-md-5 z-2">
        
        <!-- Nombre del Hotel -->
        <h1 class="display-2 fw-extra-bold mb-2 text-shadow">
          {{ currentHotel.name }}
        </h1>
        
        <!-- Ubicación y Estrellas -->
        <div class="d-flex align-items-center flex-wrap gap-3 mb-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-geo-alt-fill fs-5 text-light opacity-75"></i>
            <span class="fs-4 text-light opacity-90 letter-spacing-1">
              {{ currentHotel.city }}, {{ currentHotel.province }}
            </span>
          </div>
          
          <div class="bg-white bg-opacity-50" style="width: 1px; height: 24px;"></div>
          
          <div class="d-flex align-items-center gap-1">
            @for (star of [].constructor(currentHotel.stars); track $index) {
              <i class="bi bi-star-fill text-warning fs-4"></i>
            }
            <span class="text-light opacity-75 fs-5 letter-spacing-1 ms-1">EXCELENCIA</span>
          </div>
        </div>
        
        <!-- Precio y Botones -->
        <div class="d-flex align-items-center flex-wrap gap-3 mt-3">
          <div class="d-flex align-items-baseline">
            <span class="fs-5 text-light opacity-75 me-2 letter-spacing-1">DESDE</span>
            <span class="display-3 fw-extra-bold text-white">{{ currentHotel.price }}</span>
            <span class="fs-5 text-light opacity-75 ms-2 letter-spacing-1">€ / NOCHE</span>
          </div>
          
          <div class="bg-white bg-opacity-50" style="width: 1px; height: 32px;"></div>
          
          <div class="d-flex gap-2">
            <button class="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-all border-0"
                    (click)="onReservar()"
                    style="background: linear-gradient(135deg, #198754, #20c997);">
              <i class="bi bi-calendar-check"></i>
              <span class="letter-spacing-1">RESERVAR</span>
            </button>
            
            <button class="btn btn-outline-light rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-all"
                    (click)="onMoreInfo()">
              <i class="bi bi-info-circle"></i>
              <span class="letter-spacing-1">DETALLES</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Flechas de navegación -->
      <button 
        class="btn btn-light btn-outline-light rounded-circle position-absolute top-50 start-0 translate-middle-y ms-4 z-2 transition-all"
        style="width: 48px; height: 48px; backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);"
        (click)="prevSlide()">
        <i class="bi bi-chevron-left fs-5 text-white"></i>
      </button>
      
      <button 
        class="btn btn-light btn-outline-light rounded-circle position-absolute top-50 end-0 translate-middle-y me-4 z-2 transition-all"
        style="width: 48px; height: 48px; backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);"
        (click)="nextSlide()">
        <i class="bi bi-chevron-right fs-5 text-white"></i>
      </button>
      
      <!-- Indicadores -->
      <div class="position-absolute bottom-0 start-50 translate-middle-x mb-4 z-2">
        <div class="d-flex gap-2">
          @for (hotel of hotels; track hotel.id; let i = $index) {
            <button 
              class="btn btn-sm p-0 transition-all"
              (click)="goToSlide(i)">
              <div class="rounded-circle transition-all" 
                   [class]="i === currentIndex ? 'bg-white' : 'bg-white bg-opacity-25'"
                   style="width: 8px; height: 8px;">
              </div>
            </button>
          }
        </div>
      </div>
      
    </div>
  `
})
export class Carrusel implements OnInit, OnDestroy {
  // Datos de los hoteles
  hotels: Hotel[] = [
    {
      id: 1,
      name: 'HOTEL 3 DE AGOSTO',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 299,
      image: 'tres de agosto.png'
    },
    {
      id: 2,
      name: 'HOTEL SOFITEL',
      stars: 5,
      city: 'Sipopo',
      province: 'Bioko Norte',
      price: 450,
      image: 'sofitel.png'
    },
    {
      id: 3,
      name: 'PANÁFRICA HOTEL',
      stars: 5,
      city: 'Bata',
      province: 'Litoral',
      price: 350,
      image: 'panafrica.png'
    },
    {
      id: 4,
      name: 'BISILA PALACE',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 420,
      image: 'Bisila palace.png'
    },
    {
      id: 5,
      name: 'GRAND HOTEL BATA',
      stars: 5,
      city: 'Bata',
      province: 'Litoral',
      price: 320,
      image: 'grand hotel Bata.png'
    },
    {
      id: 6,
      name: 'HOTEL ANDA CHINA',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 280,
      image: 'anda china.png'
    },
    {
      id: 7,
      name: 'HOTEL MOKA',
      stars: 4,
      city: 'Moka',
      province: 'Bioko Sur',
      price: 220,
      image: 'hotel Moka.jpeg'
    }
  ];

  // Variables de estado
  currentIndex = 0;
  isLoading = false;
  isTransitioning = false;
  
  // Temporizador y constantes
  private timerInterval: any;
  private readonly INTERVAL_DURATION = 4000; // 4 segundos entre cambios

  ngOnInit(): void {
    this.preloadImages();
    // Iniciar el carrusel automático después de un breve retraso
    setTimeout(() => {
      this.startAutoRotation();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prevSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSlide();
    } else if (event.key === ' ') {
      event.preventDefault();
      this.nextSlide();
    }
  }

  // Getter para el hotel actual
  get currentHotel(): Hotel {
    return this.hotels[this.currentIndex];
  }

  // Precargar todas las imágenes para transiciones suaves
  private preloadImages(): void {
    this.hotels.forEach(hotel => {
      const img = new Image();
      img.src = hotel.image;
      img.onload = () => {
        console.log(`Imagen precargada: ${hotel.name}`);
      };
      img.onerror = () => {
        console.warn(`Error precargando: ${hotel.image}`);
        // Crear imagen de respaldo
        hotel.image = this.createFallbackImage(hotel.name);
      };
    });
  }

  // Crear imagen SVG de respaldo
  private createFallbackImage(hotelName: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <rect width="1200" height="800" fill="#0f172a"/>
        <rect x="200" y="150" width="800" height="450" fill="#1e293b" rx="20"/>
        <path d="M300,250 L900,250 L800,450 L400,450 Z" fill="#3b82f6" opacity="0.2"/>
        <rect x="350" y="300" width="500" height="80" fill="#475569" rx="10"/>
        <rect x="450" y="320" width="300" height="15" fill="#64748b" rx="5"/>
        <circle cx="600" cy="200" r="40" fill="#f59e0b"/>
        <text x="600" cy="200" font-family="Arial" font-size="36" font-weight="900" fill="white" text-anchor="middle" alignment-baseline="middle">🏨</text>
        <text x="600" y="400" font-family="Arial" font-size="28" font-weight="700" fill="white" text-anchor="middle">${hotelName}</text>
        <text x="600" y="450" font-family="Arial" font-size="20" fill="#94a3b8" text-anchor="middle">HOTEL DE LUJO</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Iniciar rotación automática
  private startAutoRotation(): void {
    this.stopAutoRotation(); // Asegurarse de que no hay intervalos previos
    
    this.timerInterval = setInterval(() => {
      this.nextSlideAuto(); // Método optimizado para transición automática
    }, this.INTERVAL_DURATION);
  }

  // Detener rotación automática
  private stopAutoRotation(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Método optimizado para transición automática
  private nextSlideAuto(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Calcular siguiente índice
    const nextIndex = (this.currentIndex + 1) % this.hotels.length;
    
    // Preparar la imagen siguiente
    const nextImage = new Image();
    nextImage.src = this.hotels[nextIndex].image;
    nextImage.onload = () => {
      // Cuando la imagen está cargada, hacer la transición
      this.currentIndex = nextIndex;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    nextImage.onerror = () => {
      // Si hay error, usar imagen de respaldo
      this.hotels[nextIndex].image = this.createFallbackImage(this.hotels[nextIndex].name);
      this.currentIndex = nextIndex;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    // Mostrar spinner solo si la imagen no está en caché
    this.isLoading = !nextImage.complete;
  }

  // Navegar a la siguiente imagen (manual)
  nextSlide(): void {
    this.stopAutoRotation(); // Detener temporalmente el automático
    this.nextSlideAuto();    // Cambiar a la siguiente imagen
    // Reanudar el automático después del cambio manual
    setTimeout(() => {
      this.startAutoRotation();
    }, this.INTERVAL_DURATION);
  }

  // Navegar a la imagen anterior
  prevSlide(): void {
    if (this.isTransitioning) return;
    
    this.stopAutoRotation(); // Detener temporalmente el automático
    
    this.isTransitioning = true;
    this.isLoading = true;
    
    // Calcular índice anterior
    const prevIndex = (this.currentIndex - 1 + this.hotels.length) % this.hotels.length;
    
    // Preparar la imagen anterior
    const prevImage = new Image();
    prevImage.src = this.hotels[prevIndex].image;
    prevImage.onload = () => {
      this.currentIndex = prevIndex;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    prevImage.onerror = () => {
      this.hotels[prevIndex].image = this.createFallbackImage(this.hotels[prevIndex].name);
      this.currentIndex = prevIndex;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    // Reanudar el automático después del cambio manual
    setTimeout(() => {
      this.startAutoRotation();
    }, this.INTERVAL_DURATION);
  }

  // Ir a una imagen específica
  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.stopAutoRotation(); // Detener temporalmente el automático
    
    this.isTransitioning = true;
    this.isLoading = true;
    
    // Preparar la imagen seleccionada
    const selectedImage = new Image();
    selectedImage.src = this.hotels[index].image;
    selectedImage.onload = () => {
      this.currentIndex = index;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    selectedImage.onerror = () => {
      this.hotels[index].image = this.createFallbackImage(this.hotels[index].name);
      this.currentIndex = index;
      this.isLoading = false;
      this.isTransitioning = false;
    };
    
    // Reanudar el automático después del cambio manual
    setTimeout(() => {
      this.startAutoRotation();
    }, this.INTERVAL_DURATION);
  }

  // Reservar hotel
  onReservar(): void {
    const hotel = this.currentHotel;
    const message = `📋 RESERVA: ${hotel.name}\n\n📍 ${hotel.city}, ${hotel.province}\n⭐ ${hotel.stars} estrellas\n💰 ${hotel.price}€ por noche\n\n¿Desea continuar con la reserva?`;
    
    if (confirm(message)) {
      alert(`✅ RESERVA CONFIRMADA\n\nHotel: ${hotel.name}\nPrecio: ${hotel.price}€ por noche\n\nRecibirá un email de confirmación en breve.`);
    }
  }

  // Ver más información
  onMoreInfo(): void {
    const hotel = this.currentHotel;
    const info = `
      🏨 ${hotel.name}
      
      📍 ${hotel.city}, ${hotel.province}
      ⭐ ${hotel.stars} ESTRELLAS
      💰 ${hotel.price}€ por noche
      
      💎 SERVICIOS PREMIUM:
      • Spa & Wellness Center
      • Piscina climatizada
      • Restaurante gourmet
      • Business Center
      • Concierge 24/7
      • High-Speed Wi-Fi
      • Valet Parking
      • Room Service 24h
      
      🎯 EXPERIENCIA EXCLUSIVA
    `;
    
    alert(info);
  }
}

export default Carrusel;