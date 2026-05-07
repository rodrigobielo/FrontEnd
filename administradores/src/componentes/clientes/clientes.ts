// componentes/clientes/clientes.ts

import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Servicios
import { ReservaService } from '../../servicios/reserva.service';
import { ClienteService } from '../../servicios/cliente.service';
import { AuthService } from '../../servicios/auth.service';

// Modelos
import { Reserva, ESTADOS_RESERVA } from '../../modelos/reserva.model';
import { ClienteConDetalles, ESTADOS_CLIENTE } from '../../modelos/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit, OnDestroy, AfterViewInit {
  // Servicios
  private reservaService = inject(ReservaService);
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  // Formularios
  clienteForm: FormGroup;
  filtroForm: FormGroup;
  
  // Estados
  cargando: boolean = false;
  guardando: boolean = false;
  filtroTexto: string = '';
  filtroEstado: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  
  // Datos
  clientesConReservas: ClienteConDetalles[] = [];
  clientesFiltrados: ClienteConDetalles[] = [];
  clienteSeleccionado: ClienteConDetalles | null = null;
  clienteAEliminar: ClienteConDetalles | null = null;
  
  // Estadísticas
  totalClientes: number = 0;
  clientesActivos: number = 0;
  clientesHoy: number = 0;
  clientesProximos: number = 0;
  
  // Estados disponibles para filtro
  estados = [
    { valor: '', label: 'Todos los estados', clase: 'secondary', icon: 'bi-list-check' },
    { valor: ESTADOS_CLIENTE.ACTIVO, label: 'Activo', clase: 'success', icon: 'bi-check-circle' },
    { valor: ESTADOS_CLIENTE.EN_CURSO, label: 'En curso', clase: 'primary', icon: 'bi-activity' },
    { valor: ESTADOS_CLIENTE.PROXIMO, label: 'Próximo', clase: 'info', icon: 'bi-calendar-week' },
    { valor: ESTADOS_CLIENTE.FINALIZADO, label: 'Finalizado', clase: 'secondary', icon: 'bi-check-all' },
    { valor: ESTADOS_CLIENTE.PENDIENTE, label: 'Pendiente', clase: 'warning', icon: 'bi-clock' },
    { valor: ESTADOS_CLIENTE.INACTIVO, label: 'Inactivo', clase: 'danger', icon: 'bi-person-x' }
  ];
  
  // Estados de reserva
  estadosReserva = [
    { valor: ESTADOS_RESERVA.PENDIENTE, label: 'Pendiente', clase: 'warning', icon: 'bi-clock' },
    { valor: ESTADOS_RESERVA.CONFIRMADA, label: 'Confirmada', clase: 'info', icon: 'bi-check-circle' },
    { valor: ESTADOS_RESERVA.PAGADA, label: 'Pagada', clase: 'success', icon: 'bi-credit-card' },
    { valor: ESTADOS_RESERVA.CANCELADA, label: 'Cancelada', clase: 'danger', icon: 'bi-x-circle' },
    { valor: ESTADOS_RESERVA.RECHAZADA, label: 'Rechazada', clase: 'danger', icon: 'bi-x-octagon' }
  ];
  
  // Modales
  private detallesModalInstance: any;
  private editarModalInstance: any;
  private confirmarModalInstance: any;
  
  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('editarModal') editarModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;
  
  // Mensajes
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Temporizadores
  private temporizadores: any[] = [];
  
  constructor() {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      numPasaporte: ['', [Validators.required, Validators.minLength(5)]],
      nacionalidad: [''],
      direccion: [''],
      notas: ['']
    });
    
    this.filtroForm = this.fb.group({
      estado: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }
  
  ngOnInit(): void {
    this.cargarClientesConReservas();
    this.setupFiltros();
  }
  
  ngAfterViewInit(): void {
    this.initModales();
  }
  
  ngOnDestroy(): void {
    this.destroyModales();
    this.limpiarTemporizadores();
  }
  
  private initModales(): void {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      if (this.detallesModalRef?.nativeElement) {
        this.detallesModalInstance = new (window as any).bootstrap.Modal(this.detallesModalRef.nativeElement);
      }
      if (this.editarModalRef?.nativeElement) {
        this.editarModalInstance = new (window as any).bootstrap.Modal(this.editarModalRef.nativeElement);
      }
      if (this.confirmarModalRef?.nativeElement) {
        this.confirmarModalInstance = new (window as any).bootstrap.Modal(this.confirmarModalRef.nativeElement);
      }
    }
  }
  
  private destroyModales(): void {
    if (this.detallesModalInstance) this.detallesModalInstance.dispose();
    if (this.editarModalInstance) this.editarModalInstance.dispose();
    if (this.confirmarModalInstance) this.confirmarModalInstance.dispose();
  }
  
  private limpiarTemporizadores(): void {
    this.temporizadores.forEach(timer => clearTimeout(timer));
    this.temporizadores = [];
  }
  
  private mostrarExito(mensaje: string): void {
    this.mostrarMensajeExito = true;
    this.mensajeExito = mensaje;
    const timer = setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensajeExito = '';
    }, 4000);
    this.temporizadores.push(timer);
  }
  
  private mostrarError(mensaje: string): void {
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    const timer = setTimeout(() => {
      this.mostrarMensajeError = false;
      this.mensajeError = '';
    }, 5000);
    this.temporizadores.push(timer);
  }
  
  private mostrarInfo(mensaje: string): void {
    this.mostrarMensajeInfo = true;
    this.mensajeInfo = mensaje;
    const timer = setTimeout(() => {
      this.mostrarMensajeInfo = false;
      this.mensajeInfo = '';
    }, 3000);
    this.temporizadores.push(timer);
  }
  
  private setupFiltros(): void {
    this.filtroForm.valueChanges.subscribe(() => {
      this.filtroEstado = this.filtroForm.get('estado')?.value || '';
      this.filtroFechaInicio = this.filtroForm.get('fechaInicio')?.value || '';
      this.filtroFechaFin = this.filtroForm.get('fechaFin')?.value || '';
      this.aplicarFiltros();
    });
  }
  
  cargarClientesConReservas(): void {
    this.cargando = true;
    
    // Obtener el hotel actual del authService
    const hotelActual = this.authService.getCurrentHotel();
    const hotelId = hotelActual?.id;
    
    // Usar el clienteService para obtener clientes del hotel
    if (hotelId) {
      this.clienteService.getClientesPorHotel(hotelId).subscribe({
        next: (response) => {
          this.clientesConReservas = response.data;
          this.calcularEstadisticas();
          this.aplicarFiltros();
          this.cargando = false;
          
          if (this.clientesConReservas.length === 0) {
            this.mostrarInfo('No hay clientes registrados para este hotel');
          }
        },
        error: (error) => {
          console.error('Error cargando clientes desde API:', error);
          this.cargarClientesDesdeReservas(hotelId);
        }
      });
    } else {
      // Si no hay hotel específico, cargar todos los clientes
      this.clienteService.getClientes().subscribe({
        next: (response) => {
          this.clientesConReservas = response.data;
          this.calcularEstadisticas();
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando clientes:', error);
          this.cargarClientesDesdeReservas();
        }
      });
    }
  }
  
  private cargarClientesDesdeReservas(hotelId?: number): void {
    this.reservaService.getReservas().subscribe({
      next: (reservas: Reserva[]) => {
        this.clientesConReservas = this.clienteService.transformarReservasAClientes(reservas, hotelId);
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
        
        if (this.clientesConReservas.length === 0) {
          this.mostrarInfo('No se encontraron clientes con reservas');
        }
      },
      error: (error: any) => {
        console.error('Error cargando reservas:', error);
        this.mostrarError('No se pudieron cargar los clientes');
        this.cargando = false;
        this.clientesConReservas = [];
        this.clientesFiltrados = [];
      }
    });
  }
  
  calcularEstadisticas(): void {
    this.totalClientes = this.clientesConReservas.length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Clientes activos (con reservas en curso)
    this.clientesActivos = this.clientesConReservas.filter(cliente => 
      cliente.estado === ESTADOS_CLIENTE.EN_CURSO
    ).length;
    
    // Clientes que llegan hoy (check-in hoy)
    this.clientesHoy = this.clientesConReservas.filter(cliente =>
      cliente.reservas.some(reserva => {
        const entrada = new Date(reserva.fechaEntrada);
        return entrada.toDateString() === hoy.toDateString();
      })
    ).length;
    
    // Clientes con reservas próximas
    this.clientesProximos = this.clientesConReservas.filter(cliente =>
      cliente.estado === ESTADOS_CLIENTE.PROXIMO
    ).length;
  }
  
  aplicarFiltros(): void {
    let resultado = [...this.clientesConReservas];
    
    // Filtro por texto (nombre, email, documento)
    if (this.filtroTexto) {
      const texto = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(cliente =>
        cliente.nombre.toLowerCase().includes(texto) ||
        cliente.apellidos.toLowerCase().includes(texto) ||
        cliente.nombreCompleto.toLowerCase().includes(texto) ||
        cliente.email.toLowerCase().includes(texto) ||
        cliente.numPasaporte.toLowerCase().includes(texto) ||
        cliente.telefono.includes(texto)
      );
    }
    
    // Filtro por estado del cliente
    if (this.filtroEstado) {
      resultado = resultado.filter(cliente => cliente.estado === this.filtroEstado);
    }
    
    // Filtro por fechas de reserva
    if (this.filtroFechaInicio) {
      const fechaInicio = new Date(this.filtroFechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      resultado = resultado.filter(cliente =>
        cliente.reservas.some(reserva => 
          new Date(reserva.fechaEntrada) >= fechaInicio
        )
      );
    }
    
    if (this.filtroFechaFin) {
      const fechaFin = new Date(this.filtroFechaFin);
      fechaFin.setHours(23, 59, 59, 999);
      resultado = resultado.filter(cliente =>
        cliente.reservas.some(reserva => 
          new Date(reserva.fechaSalida) <= fechaFin
        )
      );
    }
    
    this.clientesFiltrados = resultado;
    this.paginaActual = 1;
    
    if (this.filtroTexto && resultado.length === 0 && this.clientesConReservas.length > 0) {
      this.mostrarInfo(`No se encontraron clientes con "${this.filtroTexto}"`);
    }
  }
  
  filtrarPorTexto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }
  
  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.filtroForm.patchValue({ estado }, { emitEvent: true });
  }
  
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroForm.reset();
    this.aplicarFiltros();
  }
  
  verDetalles(cliente: ClienteConDetalles): void {
    this.clienteSeleccionado = cliente;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }
  
  editarCliente(cliente: ClienteConDetalles): void {
    this.clienteSeleccionado = cliente;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      email: cliente.email,
      telefono: cliente.telefono,
      numPasaporte: cliente.numPasaporte,
      nacionalidad: cliente.nacionalidad,
      direccion: cliente.direccion || '',
      notas: ''
    });
    
    if (this.editarModalInstance) {
      this.editarModalInstance.show();
    }
  }
  
  guardarCliente(): void {
    if (this.clienteForm.invalid) {
      Object.keys(this.clienteForm.controls).forEach(key => {
        this.clienteForm.get(key)?.markAsTouched();
      });
      this.mostrarError('Por favor, corrige los errores en el formulario');
      return;
    }
    
    this.guardando = true;
    
    if (this.clienteSeleccionado) {
      const datosActualizados = {
        nombre: this.clienteForm.get('nombre')?.value,
        apellidos: this.clienteForm.get('apellidos')?.value,
        email: this.clienteForm.get('email')?.value,
        telefono: this.clienteForm.get('telefono')?.value,
        numPasaporte: this.clienteForm.get('numPasaporte')?.value,
        nacionalidad: this.clienteForm.get('nacionalidad')?.value,
        direccion: this.clienteForm.get('direccion')?.value
      };
      
      this.clienteService.actualizarCliente(this.clienteSeleccionado.id, datosActualizados).subscribe({
        next: () => {
          this.mostrarExito('Cliente actualizado correctamente');
          this.cargarClientesConReservas();
          this.guardando = false;
          
          if (this.editarModalInstance) {
            this.editarModalInstance.hide();
          }
        },
        error: (error) => {
          console.error('Error actualizando cliente:', error);
          this.mostrarError('No se pudo actualizar el cliente');
          this.guardando = false;
        }
      });
    }
  }
  
  prepararEliminar(cliente: ClienteConDetalles): void {
    this.clienteAEliminar = cliente;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }
  
  confirmarEliminar(): void {
    if (!this.clienteAEliminar) return;
    
    this.guardando = true;
    
    this.clienteService.desactivarCliente(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.mostrarExito('Cliente desactivado correctamente');
        this.cargarClientesConReservas();
        this.guardando = false;
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.clienteAEliminar = null;
      },
      error: (error) => {
        console.error('Error desactivando cliente:', error);
        this.mostrarError('No se pudo desactivar el cliente');
        this.guardando = false;
      }
    });
  }
  
  getReservaActual(cliente: ClienteConDetalles): Reserva | null {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const enCurso = cliente.reservas.find(reserva => {
      const entrada = new Date(reserva.fechaEntrada);
      const salida = new Date(reserva.fechaSalida);
      return entrada <= hoy && salida >= hoy;
    });
    
    if (enCurso) return enCurso;
    
    const futuras = cliente.reservas
      .filter(reserva => new Date(reserva.fechaEntrada) > hoy)
      .sort((a, b) => new Date(a.fechaEntrada).getTime() - new Date(b.fechaEntrada).getTime());
    
    if (futuras.length > 0) return futuras[0];
    
    if (cliente.reservas.length > 0) {
      return cliente.reservas.sort((a, b) => 
        new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime()
      )[0];
    }
    
    return null;
  }
  
  getClaseEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? `bg-${estadoObj.clase}-subtle text-${estadoObj.clase}-emphasis` : 'bg-secondary-subtle text-secondary-emphasis';
  }
  
  getIconoEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? estadoObj.icon : 'bi-question-circle';
  }
  
  getLabelEstado(estado: string): string {
    const estadoObj = this.estados.find(e => e.valor === estado);
    return estadoObj ? estadoObj.label : estado;
  }
  
  getClaseReservaEstado(estado: string): string {
    const estadoObj = this.estadosReserva.find(e => e.valor === estado);
    return estadoObj ? `bg-${estadoObj.clase}` : 'bg-secondary';
  }
  
  getLabelReservaEstado(estado: string): string {
    const estadoObj = this.estadosReserva.find(e => e.valor === estado);
    return estadoObj ? estadoObj.label : estado;
  }
  
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  formatearFechaHora(fecha: Date | string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  }
  
  calcularNoches(fechaEntrada: Date, fechaSalida: Date): number {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diff = salida.getTime() - entrada.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
  
  get clientesPaginados(): ClienteConDetalles[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }
  
  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina);
  }
  
  get paginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const maxVisible = 5;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let inicio = Math.max(1, actual - 2);
    let fin = Math.min(total, inicio + maxVisible - 1);
    
    if (fin - inicio + 1 < maxVisible) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }
    
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }
  
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  exportarClientes(): void {
    const datos = this.clientesFiltrados.map(cliente => ({
      'Nombre': cliente.nombreCompleto,
      'Email': cliente.email,
      'Teléfono': cliente.telefono,
      'Documento': cliente.numPasaporte,
      'Nacionalidad': cliente.nacionalidad,
      'Dirección': cliente.direccion || '',
      'Total Reservas': cliente.totalReservas,
      'Total Gastado': cliente.totalGastado,
      'Estado': this.getLabelEstado(cliente.estado),
      'Última Reserva': this.formatearFecha(cliente.ultimaReserva)
    }));
    
    const headers = Object.keys(datos[0] || {});
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of datos) {
      const values = headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${this.formatearFecha(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.mostrarExito('Clientes exportados correctamente');
  }
  
  refrescar(): void {
    this.cargarClientesConReservas();
  }
}