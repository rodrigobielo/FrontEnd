import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Reserva {
  id: number;
  fechaReserva: Date;
  hotel: string;
  tipoHabitacion: string;
  fechaEntrada: Date;
  fechaSalida: Date;
  numHuespedes: number;
  precio: number;
  pedidoEspecial: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  codigoReserva: string;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrls: ['./reservas.css']
})
export class ReservasComponent implements OnInit {
  mostrarFormulario = signal(false);
  modoEdicion = signal(false);
  reservaEditando = signal<number | null>(null);

  // Datos para formulario
  hoteles = [
    'Hotel Plaza Central',
    'Grand Luxury Resort',
    'Seaside Paradise',
    'Mountain View Lodge',
    'City Business Hotel'
  ];

  tiposHabitacion = [
    { tipo: 'Individual', precio: 80 },
    { tipo: 'Doble', precio: 120 },
    { tipo: 'Suite', precio: 200 },
    { tipo: 'Suite Presidencial', precio: 350 },
    { tipo: 'Familiar', precio: 180 }
  ];

  // Nueva reserva (formulario)
  nuevaReserva = {
    fechaReserva: new Date().toISOString().split('T')[0],
    hotel: '',
    tipoHabitacion: '',
    fechaEntrada: '',
    fechaSalida: '',
    numHuespedes: 1,
    precio: 0,
    pedidoEspecial: '',
    estado: 'pendiente' as 'pendiente' | 'aceptada' | 'rechazada',
    codigoReserva: ''
  };

  // Lista de reservas
  reservas = signal<Reserva[]>([
    {
      id: 1,
      fechaReserva: new Date('2024-03-10'),
      hotel: 'Hotel Plaza Central',
      tipoHabitacion: 'Doble',
      fechaEntrada: new Date('2024-04-15'),
      fechaSalida: new Date('2024-04-20'),
      numHuespedes: 2,
      precio: 120,
      pedidoEspecial: 'Cama king size',
      estado: 'pendiente',
      codigoReserva: 'RES-001-P'
    },
    {
      id: 2,
      fechaReserva: new Date('2024-03-12'),
      hotel: 'Grand Luxury Resort',
      tipoHabitacion: 'Suite',
      fechaEntrada: new Date('2024-05-10'),
      fechaSalida: new Date('2024-05-17'),
      numHuespedes: 2,
      precio: 200,
      pedidoEspecial: 'Vista al mar',
      estado: 'aceptada',
      codigoReserva: 'RES-002-A'
    },
    {
      id: 3,
      fechaReserva: new Date('2024-03-08'),
      hotel: 'Seaside Paradise',
      tipoHabitacion: 'Familiar',
      fechaEntrada: new Date('2024-06-01'),
      fechaSalida: new Date('2024-06-10'),
      numHuespedes: 4,
      precio: 180,
      pedidoEspecial: 'Cuna para bebé',
      estado: 'rechazada',
      codigoReserva: 'RES-003-R'
    },
    {
      id: 4,
      fechaReserva: new Date('2024-03-15'),
      hotel: 'City Business Hotel',
      tipoHabitacion: 'Individual',
      fechaEntrada: new Date('2024-04-05'),
      fechaSalida: new Date('2024-04-08'),
      numHuespedes: 1,
      precio: 80,
      pedidoEspecial: 'Despertador a las 7:00 AM',
      estado: 'aceptada',
      codigoReserva: 'RES-004-A'
    }
  ]);

  ngOnInit() {
    this.generarCodigoReserva();
  }

  // Filtrar reservas por estado
  get reservasPendientes() {
    return this.reservas().filter(r => r.estado === 'pendiente');
  }

  get reservasAceptadas() {
    return this.reservas().filter(r => r.estado === 'aceptada');
  }

  get reservasRechazadas() {
    return this.reservas().filter(r => r.estado === 'rechazada');
  }

  // Calcular total por tipo de reserva
  get totalPendientes() {
    return this.reservasPendientes.reduce((sum, r) => sum + r.precio, 0);
  }

  get totalAceptadas() {
    return this.reservasAceptadas.reduce((sum, r) => sum + r.precio, 0);
  }

  get totalRechazadas() {
    return this.reservasRechazadas.reduce((sum, r) => sum + r.precio, 0);
  }

  // Generar código de reserva automático
  generarCodigoReserva() {
    const prefix = 'RES';
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const estadoCode = this.nuevaReserva.estado === 'pendiente' ? 'P' : 
                      this.nuevaReserva.estado === 'aceptada' ? 'A' : 'R';
    this.nuevaReserva.codigoReserva = `${prefix}-${randomNum}-${estadoCode}`;
  }

  // Actualizar precio según tipo de habitación
  actualizarPrecio() {
    const tipo = this.tiposHabitacion.find(t => t.tipo === this.nuevaReserva.tipoHabitacion);
    if (tipo) {
      this.nuevaReserva.precio = tipo.precio;
    }
    this.generarCodigoReserva();
  }

  // Abrir formulario para nueva reserva
  abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.modoEdicion.set(false);
    this.reservaEditando.set(null);
    
    // Resetear formulario
    this.nuevaReserva = {
      fechaReserva: new Date().toISOString().split('T')[0],
      hotel: '',
      tipoHabitacion: '',
      fechaEntrada: '',
      fechaSalida: '',
      numHuespedes: 1,
      precio: 0,
      pedidoEspecial: '',
      estado: 'pendiente',
      codigoReserva: ''
    };
    this.generarCodigoReserva();
  }

  // Cerrar formulario
  cerrarFormulario() {
    this.mostrarFormulario.set(false);
  }

  // Enviar formulario (crear o actualizar reserva)
  enviarFormulario() {
    if (!this.validarFormulario()) return;

    if (this.modoEdicion() && this.reservaEditando() !== null) {
      // Modo edición
      const index = this.reservas().findIndex(r => r.id === this.reservaEditando());
      if (index !== -1) {
        const reservasActualizadas = [...this.reservas()];
        reservasActualizadas[index] = {
          ...this.nuevaReserva,
          id: this.reservaEditando()!,
          fechaReserva: new Date(this.nuevaReserva.fechaReserva),
          fechaEntrada: new Date(this.nuevaReserva.fechaEntrada),
          fechaSalida: new Date(this.nuevaReserva.fechaSalida)
        };
        this.reservas.set(reservasActualizadas);
      }
    } else {
      // Crear nueva reserva
      const nuevaReservaCompleta: Reserva = {
        id: this.reservas().length + 1,
        ...this.nuevaReserva,
        fechaReserva: new Date(this.nuevaReserva.fechaReserva),
        fechaEntrada: new Date(this.nuevaReserva.fechaEntrada),
        fechaSalida: new Date(this.nuevaReserva.fechaSalida)
      };
      this.reservas.set([...this.reservas(), nuevaReservaCompleta]);
    }

    this.cerrarFormulario();
  }

  // Validar formulario
  validarFormulario(): boolean {
    if (!this.nuevaReserva.hotel || 
        !this.nuevaReserva.tipoHabitacion || 
        !this.nuevaReserva.fechaEntrada || 
        !this.nuevaReserva.fechaSalida ||
        this.nuevaReserva.numHuespedes < 1) {
      alert('Por favor, complete todos los campos obligatorios');
      return false;
    }

    const fechaEntrada = new Date(this.nuevaReserva.fechaEntrada);
    const fechaSalida = new Date(this.nuevaReserva.fechaSalida);
    
    if (fechaSalida <= fechaEntrada) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return false;
    }

    return true;
  }

  // Editar reserva existente
  editarReserva(reserva: Reserva) {
    this.mostrarFormulario.set(true);
    this.modoEdicion.set(true);
    this.reservaEditando.set(reserva.id);

    this.nuevaReserva = {
      fechaReserva: reserva.fechaReserva.toISOString().split('T')[0],
      hotel: reserva.hotel,
      tipoHabitacion: reserva.tipoHabitacion,
      fechaEntrada: reserva.fechaEntrada.toISOString().split('T')[0],
      fechaSalida: reserva.fechaSalida.toISOString().split('T')[0],
      numHuespedes: reserva.numHuespedes,
      precio: reserva.precio,
      pedidoEspecial: reserva.pedidoEspecial,
      estado: reserva.estado,
      codigoReserva: reserva.codigoReserva
    };
  }

  // Eliminar reserva
  eliminarReserva(id: number) {
    if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      this.reservas.set(this.reservas().filter(r => r.id !== id));
    }
  }

  // Cambiar estado de una reserva
  cambiarEstado(reserva: Reserva, nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada') {
    const index = this.reservas().findIndex(r => r.id === reserva.id);
    if (index !== -1) {
      const reservasActualizadas = [...this.reservas()];
      reservasActualizadas[index] = {
        ...reserva,
        estado: nuevoEstado,
        codigoReserva: reserva.codigoReserva.slice(0, -1) + 
          (nuevoEstado === 'pendiente' ? 'P' : nuevoEstado === 'aceptada' ? 'A' : 'R')
      };
      this.reservas.set(reservasActualizadas);
    }
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Calcular noches de estancia
  calcularNoches(fechaEntrada: Date, fechaSalida: Date): number {
    const diferencia = fechaSalida.getTime() - fechaEntrada.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }
}