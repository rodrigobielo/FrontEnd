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
  description?: string;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Carrusel en pantalla completa con diseño premium -->
    <div class="position-relative w-100 vh-100 overflow-hidden">
      
      <!-- Imagen de fondo con efecto parallax -->
      <div class="position-absolute top-0 start-0 w-100 h-100">
        <div class="position-relative w-100 h-100">
          <img 
            [src]="currentHotel.image" 
            [alt]="currentHotel.name"
            class="w-100 h-100 hotel-image"
            [class.zoomed]="!isTransitioning"
            [class.d-none]="isLoading"
            loading="eager"
            (load)="onImageLoad()">
          
          <!-- Overlay elegante -->
          <div class="position-absolute top-0 start-0 w-100 h-100 gradient-overlay"></div>
          
          <!-- Spinner de carga premium -->
          @if (isLoading) {
            <div class="position-absolute top-50 start-50 translate-middle z-3">
              <div class="spinner-gold"></div>
            </div>
          }
        </div>
      </div>
      
      <!-- Contenido principal -->
      <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end z-2">
        <div class="container-fluid px-4 px-md-5 pb-5">
          
          <!-- Contenedor de información con efecto glass -->
          <div class="glass-effect rounded-4 p-4 p-md-5 animate-fadeInUp"
               style="max-width: 800px;">
            
            <!-- Badge de ubicación -->
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                   style="background: rgba(255, 255, 255, 0.1);">
                <i class="bi bi-geo-alt-fill fs-5" style="color: var(--gold);"></i>
                <span class="fw-semibold text-white">
                  {{ currentHotel.city }}, {{ currentHotel.province }}
                </span>
              </div>
              
              <!-- Badge de estrellas -->
              <div class="star-badge d-flex align-items-center gap-2">
                @for (star of [].constructor(currentHotel.stars); track $index) {
                  <i class="bi bi-star-fill" style="color: var(--gold);"></i>
                }
                <span class="text-white opacity-90 fw-semibold">5 ESTRELLAS</span>
              </div>
            </div>
            
            <!-- Nombre del Hotel -->
            <h1 class="display-title text-white mb-3 display-1">
              {{ currentHotel.name }}
            </h1>
            
            <!-- Descripción breve -->
            <p class="text-white opacity-75 fs-5 mb-4" style="max-width: 600px;">
              Experimente el lujo y la hospitalidad en uno de los hoteles más exclusivos de Guinea Ecuatorial. 
              Servicios premium y atención personalizada.
            </p>
            
            <!-- Precio y acciones -->
            <div class="d-flex flex-wrap align-items-center gap-4 mt-4">
              <div class="price-display">
                <span class="text-white opacity-75 me-2">DESDE</span>
                <span class="display-2 fw-bold text-gradient">{{ currentHotel.price | number }}</span>
                <span class="text-white opacity-75 ms-2">CFA / NOCHE</span>
              </div>
              
              <div class="d-flex gap-3">
                <button class="btn btn-lg gold-gradient rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-lift border-0"
                        (click)="onReservar()">
                  <i class="bi bi-calendar-check fs-4"></i>
                  <span>RESERVAR AHORA</span>
                </button>
                
                <button class="btn btn-lg btn-outline-light rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-3 transition-all hover-lift gold-border"
                        (click)="onMoreInfo()">
                  <i class="bi bi-info-circle fs-4"></i>
                  <span>EXPLORAR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Controles de navegación premium -->
      <div class="position-absolute top-50 start-0 translate-middle-y ms-4 z-3">
        <button 
          class="btn glass-effect rounded-circle d-flex align-items-center justify-content-center transition-all hover-lift"
          style="width: 56px; height: 56px;"
          (click)="prevSlide()"
          (mouseenter)="pauseRotation()"
          (mouseleave)="resumeRotation()">
          <i class="bi bi-chevron-left fs-3 text-white"></i>
        </button>
      </div>
      
      <div class="position-absolute top-50 end-0 translate-middle-y me-4 z-3">
        <button 
          class="btn glass-effect rounded-circle d-flex align-items-center justify-content-center transition-all hover-lift"
          style="width: 56px; height: 56px;"
          (click)="nextSlide()"
          (mouseenter)="pauseRotation()"
          (mouseleave)="resumeRotation()">
          <i class="bi bi-chevron-right fs-3 text-white"></i>
        </button>
      </div>
      
      <!-- Indicadores mejorados -->
      <div class="position-absolute bottom-0 start-50 translate-middle-x mb-5 z-3">
        <div class="d-flex gap-2 align-items-center p-3 glass-effect rounded-pill">
          @for (hotel of hotels; track hotel.id; let i = $index) {
            <button 
              class="btn p-0 transition-all"
              (click)="goToSlide(i)"
              (mouseenter)="pauseRotation()"
              (mouseleave)="resumeRotation()">
              <div class="rounded-circle transition-all" 
                   [class.indicator-active]="i === currentIndex"
                   [class.indicator-inactive]="i !== currentIndex">
              </div>
            </button>
          }
        </div>
      </div>
      
      <!-- Contador de slides -->
      <div class="position-absolute top-0 end-0 mt-4 me-4 z-3">
        <div class="glass-effect rounded-pill px-4 py-2">
          <span class="text-white fw-semibold">
            {{ currentIndex + 1 }} / {{ hotels.length }}
          </span>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class Carrusel implements OnInit, OnDestroy {
  // Datos de los hoteles - actualizados con francos CFA
  hotels: Hotel[] = [
    {
      id: 1,
      name: 'HOTEL 3 DE AGOSTO',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 195000, // Aproximadamente 299€ en CFA
      image: 'tres de agosto.png',
      description: 'Lujo y confort en el corazón de Malabo'
    },
    {
      id: 2,
      name: 'HOTEL SOFITEL',
      stars: 5,
      city: 'Sipopo',
      province: 'Bioko Norte',
      price: 295000,
      image: 'sofitel.png',
      description: 'Elegancia francesa en Sipopo'
    },
    {
      id: 3,
      name: 'PANÁFRICA HOTEL',
      stars: 5,
      city: 'Bata',
      province: 'Litoral',
      price: 230000,
      image: 'panafrica.png',
      description: 'Hospitalidad africana de lujo'
    },
    {
      id: 4,
      name: 'BISILA PALACE',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 275000,
      image: 'Bisila palace.png',
      description: 'Palacio de lujo en Malabo'
    },
    {
      id: 5,
      name: 'GRAND HOTEL BATA',
      stars: 5,
      city: 'Bata',
      province: 'Litoral',
      price: 210000,
      image: 'grand hotel Bata.png',
      description: 'Grandiosidad en el litoral'
    },
    {
      id: 6,
      name: 'HOTEL ANDA CHINA',
      stars: 5,
      city: 'Malabo',
      province: 'Bioko Norte',
      price: 185000,
      image: 'anda china.png',
      description: 'Fusión oriental y africana'
    },
    {
      id: 7,
      name: 'HOTEL MOKA',
      stars: 4,
      city: 'Moka',
      province: 'Bioko Sur',
      price: 145000,
      image: 'hotel Moka.jpeg',
      description: 'Naturaleza y confort en Bioko Sur'
    }
  ];

  // Variables de estado
  currentIndex = 0;
  isLoading = false;
  isTransitioning = false;
  private zoomInterval: any;
  private isAutoRotationPaused = false;
  
  // Temporizador y constantes
  private timerInterval: any;
  private readonly INTERVAL_DURATION = 6000;

  ngOnInit(): void {
    this.preloadImages();
    setTimeout(() => {
      this.startAutoRotation();
      this.startZoomEffect();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
    this.stopZoomEffect();
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
      this.toggleAutoRotation();
    } else if (event.key === 'Escape') {
      this.stopAutoRotation();
    }
  }

  get currentHotel(): Hotel {
    return this.hotels[this.currentIndex];
  }

  // Métodos públicos para el template
  pauseRotation(): void {
    this.isAutoRotationPaused = true;
    this.stopAutoRotation();
  }

  resumeRotation(): void {
    this.isAutoRotationPaused = false;
    this.startAutoRotation();
  }

  // Método para alternar la rotación automática
  toggleAutoRotation(): void {
    if (this.timerInterval) {
      this.stopAutoRotation();
    } else {
      this.startAutoRotation();
    }
  }

  // Métodos que pueden permanecer privados
  private startZoomEffect(): void {
    this.zoomInterval = setInterval(() => {
      // El efecto zoom se maneja con la clase CSS
    }, 8000);
  }

  private stopZoomEffect(): void {
    if (this.zoomInterval) {
      clearInterval(this.zoomInterval);
    }
  }

  onImageLoad(): void {
    this.isLoading = false;
    this.isTransitioning = false;
  }

  private preloadImages(): void {
    this.hotels.forEach(hotel => {
      const img = new Image();
      img.src = hotel.image;
      img.onload = () => console.log(`✅ ${hotel.name} cargado`);
      img.onerror = () => {
        console.warn(`❌ Error: ${hotel.image}`);
        hotel.image = this.createFallbackImage(hotel.name, hotel.description || '');
      };
    });
  }

  private createFallbackImage(name: string, description: string): string {
    const colors = ['#0f172a', '#1e293b', '#2d3748'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
        <rect width="1920" height="1080" fill="${color}"/>
        
        <rect x="360" y="240" width="1200" height="600" fill="#1a202c" rx="20"/>
        <path d="M480,400 L1440,400 L1320,640 L600,640 Z" fill="#D4AF37" opacity="0.2"/>
        
        <rect x="560" y="450" width="800" height="100" fill="#2d3748" rx="10"/>
        <rect x="680" y="475" width="560" height="20" fill="#4a5568" rx="5"/>
        
        <circle cx="960" cy="320" r="60" fill="#D4AF37"/>
        <text x="960" y="320" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">🏨</text>
        
        <text x="960" y="520" font-family="'Playfair Display', serif" font-size="64" font-weight="700" fill="white" text-anchor="middle">
          ${name}
        </text>
        
        <text x="960" y="590" font-family="'Inter', sans-serif" font-size="28" fill="#a0aec0" text-anchor="middle">
          ${description}
        </text>
        
        <text x="960" y="680" font-family="'Inter', sans-serif" font-size="36" fill="#D4AF37" font-weight="600" text-anchor="middle">
          ★★★★★ HOTEL DE LUJO
        </text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Métodos para rotación automática (ahora públicos)
  public startAutoRotation(): void {
    // Si está pausado manualmente, no reiniciar
    if (this.isAutoRotationPaused) return;
    
    this.stopAutoRotation();
    this.timerInterval = setInterval(() => {
      this.nextSlideAuto();
    }, this.INTERVAL_DURATION);
  }

  public stopAutoRotation(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private nextSlideAuto(): void {
    if (this.isTransitioning || this.isAutoRotationPaused) return;
    
    this.isTransitioning = true;
    this.isLoading = true;
    
    const nextIndex = (this.currentIndex + 1) % this.hotels.length;
    const nextImage = new Image();
    nextImage.src = this.hotels[nextIndex].image;
    
    nextImage.onload = () => {
      setTimeout(() => {
        this.currentIndex = nextIndex;
        this.isLoading = false;
        this.isTransitioning = false;
      }, 300);
    };
    
    nextImage.onerror = () => {
      this.hotels[nextIndex].image = this.createFallbackImage(
        this.hotels[nextIndex].name,
        this.hotels[nextIndex].description || ''
      );
      this.currentIndex = nextIndex;
      this.isLoading = false;
      this.isTransitioning = false;
    };
  }

  // Métodos de navegación (públicos)
  nextSlide(): void {
    this.stopAutoRotation();
    this.isTransitioning = true;
    this.isLoading = true;
    
    const nextIndex = (this.currentIndex + 1) % this.hotels.length;
    const nextImage = new Image();
    nextImage.src = this.hotels[nextIndex].image;
    
    nextImage.onload = () => {
      setTimeout(() => {
        this.currentIndex = nextIndex;
        this.isLoading = false;
        this.isTransitioning = false;
        // Reanudar rotación automática después de un cambio manual
        setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
      }, 300);
    };
    
    nextImage.onerror = () => {
      this.hotels[nextIndex].image = this.createFallbackImage(
        this.hotels[nextIndex].name,
        this.hotels[nextIndex].description || ''
      );
      this.currentIndex = nextIndex;
      this.isLoading = false;
      this.isTransitioning = false;
      setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
    };
  }

  prevSlide(): void {
    if (this.isTransitioning) return;
    
    this.stopAutoRotation();
    this.isTransitioning = true;
    this.isLoading = true;
    
    const prevIndex = (this.currentIndex - 1 + this.hotels.length) % this.hotels.length;
    const prevImage = new Image();
    prevImage.src = this.hotels[prevIndex].image;
    
    prevImage.onload = () => {
      setTimeout(() => {
        this.currentIndex = prevIndex;
        this.isLoading = false;
        this.isTransitioning = false;
        setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
      }, 300);
    };
    
    prevImage.onerror = () => {
      this.hotels[prevIndex].image = this.createFallbackImage(
        this.hotels[prevIndex].name,
        this.hotels[prevIndex].description || ''
      );
      this.currentIndex = prevIndex;
      this.isLoading = false;
      this.isTransitioning = false;
      setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
    };
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.stopAutoRotation();
    this.isTransitioning = true;
    this.isLoading = true;
    
    const selectedImage = new Image();
    selectedImage.src = this.hotels[index].image;
    
    selectedImage.onload = () => {
      setTimeout(() => {
        this.currentIndex = index;
        this.isLoading = false;
        this.isTransitioning = false;
        setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
      }, 300);
    };
    
    selectedImage.onerror = () => {
      this.hotels[index].image = this.createFallbackImage(
        this.hotels[index].name,
        this.hotels[index].description || ''
      );
      this.currentIndex = index;
      this.isLoading = false;
      this.isTransitioning = false;
      setTimeout(() => this.startAutoRotation(), this.INTERVAL_DURATION);
    };
  }

  onReservar(): void {
    const hotel = this.currentHotel;
    const formattedPrice = hotel.price.toLocaleString('fr-FR');
    
    const message = `🏨 RESERVA EXCLUSIVA\n\n` +
                    `📍 ${hotel.name}\n` +
                    `🏙️ ${hotel.city}, ${hotel.province}\n` +
                    `⭐ ${hotel.stars} Estrellas de Lujo\n` +
                    `💰 ${formattedPrice} CFA por noche\n\n` +
                    `¿Confirmar reserva en este hotel premium?`;
    
    if (confirm(message)) {
      const confirmation = `✅ RESERVA CONFIRMADA\n\n` +
                          `Hotel: ${hotel.name}\n` +
                          `Precio: ${formattedPrice} CFA / noche\n` +
                          `Ubicación: ${hotel.city}, ${hotel.province}\n\n` +
                          `Recibirá un correo de confirmación con todos los detalles.\n\n` +
                          `¡Gracias por elegirnos!`;
      alert(confirmation);
    }
  }

  onMoreInfo(): void {
    const hotel = this.currentHotel;
    const formattedPrice = hotel.price.toLocaleString('fr-FR');
    
    const info = `
      🏨 ${hotel.name}
      
      📍 UBICACIÓN EXCLUSIVA
      ${hotel.city}, ${hotel.province}
      
      ⭐ CLASIFICACIÓN
      ${hotel.stars} Estrellas - Categoría Premium
      
      💰 TARIFA POR NOCHE
      ${formattedPrice} CFA
      
      ✨ SERVICIOS & AMENIDADES:
      
      🛏️  Habitaciones Suite Premium
      🍽️  Restaurante Gourmet
      🏊 Piscina Infinity
      💆‍♂️ Spa & Wellness Center
      🏋️‍♂️ Gimnasio 24/7
      📶 Wi-Fi Ultra Rápido
      🅿️ Valet Parking
      👨‍🍳 Room Service 24h
      🎯 Concierge Personal
      
      🌟 EXPERIENCIA ÚNICA:
      • Vistas Panorámicas
      • Decoración de Vanguardia
      • Atención Personalizada
      • Eventos Exclusivos
      
      📞 CONTACTO: +240 222 000 000
    `;
    
    alert(info);
  }
}

export default Carrusel;