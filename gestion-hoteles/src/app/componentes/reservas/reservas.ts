import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Declaración para TypeScript - Bootstrap está disponible globalmente
declare var bootstrap: any;

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrls: ['./reservas.css']
})
export class ReservasComponent implements OnInit {
  // Datos de ejemplo para reservas
  reservas = {
    pendientes: [
      {
        id: 1,
        hotel: 'Hotel Plaza Malabo',
        tipo: 'Habitación Deluxe',
        checkIn: '2024-03-15',
        checkOut: '2024-03-20',
        huespedes: '2 adultos',
        total: 450.00,
        codigo: 'RES-MAL-2024-00123',
        estado: 'pendiente'
      },
      {
        id: 2,
        hotel: 'Hotel Bahía Bata',
        tipo: 'Suite Ejecutiva',
        checkIn: '2024-04-10',
        checkOut: '2024-04-12',
        huespedes: '1 adulto',
        total: 320.00,
        codigo: 'RES-BAT-2024-00245',
        estado: 'pendiente'
      }
    ],
    confirmadas: [
      {
        id: 3,
        hotel: 'Hotel Mongomo Palace',
        tipo: 'Habitación Standard',
        checkIn: '2024-04-10',
        checkOut: '2024-04-18',
        huespedes: '2 adultos, 1 niño',
        total: 1200.00,
        codigo: 'RES-MON-2024-00456',
        estado: 'confirmada'
      },
      {
        id: 4,
        hotel: 'Hotel Utonde',
        tipo: 'Suite Presidencial',
        checkIn: '2024-05-05',
        checkOut: '2024-05-10',
        huespedes: '4 adultos',
        total: 1800.00,
        codigo: 'RES-UTO-2024-00567',
        estado: 'confirmada'
      }
    ],
    canceladas: [
      {
        id: 5,
        hotel: 'Hotel Continental',
        tipo: 'Habitación Standard',
        checkIn: '2024-02-05',
        checkOut: '2024-02-12',
        huespedes: '1 adulto',
        total: 280.00,
        codigo: 'RES-CON-2024-00321',
        estado: 'cancelada'
      }
    ]
  };

  filtroEstado: string = '';
  filtroDesde: string = '';
  filtroHasta: string = '';

  // Modelo para nueva reserva
  nuevaReserva = {
    hotel: '',
    tipo: '',
    checkIn: '',
    checkOut: '',
    adultos: 2,
    ninos: 0,
    noches: 1,
    servicios: {
      desayuno: false,
      parking: false,
      wifi: false
    },
    comentarios: ''
  };

  // Precios - usando tipo Record para evitar error de TypeScript
  precios: Record<string, number> = {
    'Habitación Standard': 100,
    'Habitación Deluxe': 150,
    'Suite Ejecutiva': 250,
    'Suite Presidencial': 400
  };

  // Fecha mínima para reservas (hoy)
  minDate: string;

  constructor() { 
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    console.log('Componente Reservas cargado');
    // Calcular noches iniciales
    this.calcularNoches();
  }

  // Métodos para calcular noches cuando cambian las fechas
  calcularNoches(): void {
    if (this.nuevaReserva.checkIn && this.nuevaReserva.checkOut) {
      const checkInDate = new Date(this.nuevaReserva.checkIn);
      const checkOutDate = new Date(this.nuevaReserva.checkOut);
      
      // Validar que la fecha de salida sea posterior a la de entrada
      if (checkOutDate <= checkInDate) {
        this.nuevaReserva.noches = 1;
        return;
      }
      
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.nuevaReserva.noches = diffDays > 0 ? diffDays : 1;
    } else {
      this.nuevaReserva.noches = 1;
    }
  }

  // Método llamado cuando cambian las fechas en el formulario
  onFechaChange(): void {
    this.calcularNoches();
  }

  // Calcular total de la habitación - CORREGIDO
  calcularTotal(): number {
    // Usar aserción de tipo para evitar error de TypeScript
    const precioNoche = (this.precios as any)[this.nuevaReserva.tipo] || 0;
    return precioNoche * (this.nuevaReserva.noches || 1);
  }

  // Calcular servicios adicionales
  calcularServicios(): number {
    let serviciosTotal = 0;
    
    // Desayuno: €25 por persona por día
    if (this.nuevaReserva.servicios.desayuno) {
      const totalPersonas = this.nuevaReserva.adultos + this.nuevaReserva.ninos;
      serviciosTotal += totalPersonas * 25 * (this.nuevaReserva.noches || 1);
    }
    
    // Parking: €15 por día
    if (this.nuevaReserva.servicios.parking) {
      serviciosTotal += 15 * (this.nuevaReserva.noches || 1);
    }
    
    // WiFi: €10 por estancia
    if (this.nuevaReserva.servicios.wifi) {
      serviciosTotal += 10;
    }
    
    return serviciosTotal;
  }

  // Método para crear nueva reserva
  crearReserva(): void {
    console.log('Creando nueva reserva:', this.nuevaReserva);
    
    // Validar campos requeridos
    if (!this.nuevaReserva.hotel || !this.nuevaReserva.tipo) {
      alert('Por favor, seleccione un hotel y tipo de habitación');
      return;
    }
    
    // Validar fechas
    if (!this.nuevaReserva.checkIn || !this.nuevaReserva.checkOut) {
      alert('Por favor, seleccione fechas de check-in y check-out');
      return;
    }
    
    // Validar que check-out sea posterior a check-in
    const checkInDate = new Date(this.nuevaReserva.checkIn);
    const checkOutDate = new Date(this.nuevaReserva.checkOut);
    if (checkOutDate <= checkInDate) {
      alert('La fecha de check-out debe ser posterior a la fecha de check-in');
      return;
    }
    
    // Calcular total
    const totalReserva = this.calcularTotal() + this.calcularServicios();
    
    // Generar código de reserva único
    const hotelAbrev = this.nuevaReserva.hotel
      .replace('Hotel ', '')
      .substring(0, 3)
      .toUpperCase();
    
    const codigoReserva = 'RES-' + 
      hotelAbrev + 
      '-' + new Date().getFullYear() + '-' +
      Math.floor(1000 + Math.random() * 9000);
    
    // Crear nueva reserva
    const nuevaReservaObj = {
      id: this.reservas.pendientes.length + this.reservas.confirmadas.length + this.reservas.canceladas.length + 1,
      hotel: this.nuevaReserva.hotel,
      tipo: this.nuevaReserva.tipo,
      checkIn: this.nuevaReserva.checkIn,
      checkOut: this.nuevaReserva.checkOut,
      huespedes: `${this.nuevaReserva.adultos} adulto${this.nuevaReserva.adultos > 1 ? 's' : ''}` +
                (this.nuevaReserva.ninos > 0 ? `, ${this.nuevaReserva.ninos} niño${this.nuevaReserva.ninos > 1 ? 's' : ''}` : ''),
      total: totalReserva,
      codigo: codigoReserva,
      estado: 'pendiente'
    };
    
    // Agregar a reservas pendientes
    this.reservas.pendientes.push(nuevaReservaObj);
    
    // Resetear formulario
    this.resetearFormulario();
    
    // Cerrar modal usando Bootstrap JavaScript
    this.cerrarModal();
    
    // Mostrar mensaje de éxito
    alert(`¡Reserva creada exitosamente!\nCódigo: ${codigoReserva}\nTotal: €${totalReserva.toFixed(2)}`);
    
    console.log('Nueva reserva agregada:', nuevaReservaObj);
  }

  // Método para cerrar el modal de Bootstrap
  cerrarModal(): void {
    const modalElement = document.getElementById('nuevaReservaModal');
    if (modalElement) {
      // Obtener la instancia del modal de Bootstrap
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      } else {
        // Si no existe instancia, crear una nueva y esconderla
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
      }
    }
  }

  // Resetear formulario
  resetearFormulario(): void {
    this.nuevaReserva = {
      hotel: '',
      tipo: '',
      checkIn: '',
      checkOut: '',
      adultos: 2,
      ninos: 0,
      noches: 1,
      servicios: {
        desayuno: false,
        parking: false,
        wifi: false
      },
      comentarios: ''
    };
  }

  // Métodos existentes (sin cambios)
  confirmarReserva(reservaId: number): void {
    console.log('Confirmando reserva:', reservaId);
    // Lógica para confirmar reserva
    const reservaIndex = this.reservas.pendientes.findIndex(r => r.id === reservaId);
    if (reservaIndex !== -1) {
      const reserva = this.reservas.pendientes[reservaIndex];
      reserva.estado = 'confirmada';
      this.reservas.confirmadas.push(reserva);
      this.reservas.pendientes.splice(reservaIndex, 1);
      alert(`Reserva ${reserva.codigo} confirmada exitosamente`);
    }
  }

  cancelarReserva(reservaId: number): void {
    console.log('Cancelando reserva:', reservaId);
    // Lógica para cancelar reserva
    const reservaIndex = this.reservas.pendientes.findIndex(r => r.id === reservaId);
    if (reservaIndex !== -1) {
      const reserva = this.reservas.pendientes[reservaIndex];
      reserva.estado = 'cancelada';
      this.reservas.canceladas.push(reserva);
      this.reservas.pendientes.splice(reservaIndex, 1);
      alert(`Reserva ${reserva.codigo} cancelada`);
    }
  }

  filtrarReservas(): void {
    console.log('Filtrando reservas...');
    console.log('Estado:', this.filtroEstado);
    console.log('Desde:', this.filtroDesde);
    console.log('Hasta:', this.filtroHasta);
    // Lógica de filtrado (se implementará si es necesario)
  }

  // Método para abrir nueva reserva (opcional)
  abrirNuevaReserva(): void {
    // Este método ya no es necesario porque el modal se abre con data-bs-toggle
    console.log('Abrir nueva reserva - método deprecado');
  }
}