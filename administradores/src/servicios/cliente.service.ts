// servicios/cliente.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Cliente, 
  ClienteConDetalles, 
  ClienteFiltro, 
  ClienteResponse,
  ESTADOS_CLIENTE,
  getNombreCompleto 
} from '../modelos/cliente.model';
import { Reserva, ESTADOS_RESERVA } from '../modelos/reserva.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private apiUrl = 'http://localhost:8080/api';
  private clientesUrl = `${this.apiUrl}/clientes`;
  private usuariosUrl = `${this.apiUrl}/usuarios`;
  private reservasUrl = `${this.apiUrl}/reservas`;
  
  constructor() { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  getClientes(filtro?: ClienteFiltro): Observable<ClienteResponse> {
    let params = new HttpParams();
    
    if (filtro) {
      if (filtro.nombre) params = params.set('nombre', filtro.nombre);
      if (filtro.email) params = params.set('email', filtro.email);
      if (filtro.telefono) params = params.set('telefono', filtro.telefono);
      if (filtro.documento) params = params.set('documento', filtro.documento);
      if (filtro.hotelId) params = params.set('hotelId', filtro.hotelId.toString());
      if (filtro.estado) params = params.set('estado', filtro.estado);
      if (filtro.fechaInicio) params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      if (filtro.fechaFin) params = params.set('fechaFin', filtro.fechaFin.toISOString());
      if (filtro.pagina) params = params.set('pagina', filtro.pagina.toString());
      if (filtro.limite) params = params.set('limite', filtro.limite.toString());
    }
    
    return this.http.get<ClienteResponse>(this.clientesUrl, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError<ClienteResponse>('getClientes')));
  }
  
  getClienteById(id: number): Observable<ClienteConDetalles> {
    return this.http.get<ClienteConDetalles>(`${this.clientesUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<ClienteConDetalles>(`getClienteById id=${id}`)));
  }
  
  getClientesPorHotel(hotelId: number, filtro?: ClienteFiltro): Observable<ClienteResponse> {
    let params = new HttpParams();
    
    if (filtro) {
      if (filtro.nombre) params = params.set('nombre', filtro.nombre);
      if (filtro.email) params = params.set('email', filtro.email);
      if (filtro.estado) params = params.set('estado', filtro.estado);
      if (filtro.pagina) params = params.set('pagina', filtro.pagina.toString());
      if (filtro.limite) params = params.set('limite', filtro.limite.toString());
    }
    
    return this.http.get<ClienteResponse>(`${this.clientesUrl}/hotel/${hotelId}`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError<ClienteResponse>(`getClientesPorHotel hotelId=${hotelId}`)));
  }
  
  getUsuarios(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.usuariosUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<Cliente[]>('getUsuarios', [])));
  }
  
  getUsuarioById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.usuariosUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<Cliente>(`getUsuarioById id=${id}`)));
  }
  
  getClientesActivos(hotelId?: number): Observable<ClienteConDetalles[]> {
    let url = `${this.clientesUrl}/activos`;
    if (hotelId) url = `${this.clientesUrl}/hotel/${hotelId}/activos`;
    
    return this.http.get<ClienteConDetalles[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<ClienteConDetalles[]>('getClientesActivos', [])));
  }
  
  getClientesLlegadaHoy(hotelId?: number): Observable<ClienteConDetalles[]> {
    let url = `${this.clientesUrl}/llegada-hoy`;
    if (hotelId) url = `${this.clientesUrl}/hotel/${hotelId}/llegada-hoy`;
    
    return this.http.get<ClienteConDetalles[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<ClienteConDetalles[]>('getClientesLlegadaHoy', [])));
  }
  
  getClientesSalidaHoy(hotelId?: number): Observable<ClienteConDetalles[]> {
    let url = `${this.clientesUrl}/salida-hoy`;
    if (hotelId) url = `${this.clientesUrl}/hotel/${hotelId}/salida-hoy`;
    
    return this.http.get<ClienteConDetalles[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<ClienteConDetalles[]>('getClientesSalidaHoy', [])));
  }
  
  getProximasLlegadas(hotelId?: number): Observable<ClienteConDetalles[]> {
    let url = `${this.clientesUrl}/proximas-llegadas`;
    if (hotelId) url = `${this.clientesUrl}/hotel/${hotelId}/proximas-llegadas`;
    
    return this.http.get<ClienteConDetalles[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<ClienteConDetalles[]>('getProximasLlegadas', [])));
  }
  
  getEstadisticasCliente(clienteId: number): Observable<any> {
    return this.http.get(`${this.clientesUrl}/${clienteId}/estadisticas`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<any>(`getEstadisticasCliente id=${clienteId}`)));
  }
  
  actualizarCliente(id: number, clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.usuariosUrl}/${id}`, clienteData, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`Cliente ${id} actualizado`)),
        catchError(this.handleError<Cliente>(`actualizarCliente id=${id}`))
      );
  }
  
  crearCliente(clienteData: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(this.usuariosUrl, clienteData, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log('Cliente creado')),
        catchError(this.handleError<Cliente>('crearCliente'))
      );
  }
  
  desactivarCliente(id: number): Observable<any> {
    return this.http.patch(`${this.usuariosUrl}/${id}/desactivar`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`Cliente ${id} desactivado`)),
        catchError(this.handleError<any>(`desactivarCliente id=${id}`))
      );
  }
  
  getHistorialReservas(clienteId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.clientesUrl}/${clienteId}/reservas`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError<Reserva[]>(`getHistorialReservas id=${clienteId}`, [])));
  }
  
  buscarClientes(termino: string, hotelId?: number): Observable<Cliente[]> {
    let params = new HttpParams().set('termino', termino);
    if (hotelId) params = params.set('hotelId', hotelId.toString());
    
    return this.http.get<Cliente[]>(`${this.clientesUrl}/buscar`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError<Cliente[]>('buscarClientes', [])));
  }
  
  transformarReservasAClientes(reservas: any[], hotelId?: number): ClienteConDetalles[] {
    return this.procesarClientesDesdeReservas(reservas, hotelId);
  }
  
  private procesarClientesDesdeReservas(reservas: any[], hotelId?: number): ClienteConDetalles[] {
    const clientesMap = new Map<number, any>();
    
    reservas.forEach(reserva => {
      if (hotelId && reserva.hotel?.id !== hotelId && reserva.hoteles?.id !== hotelId) {
        return;
      }
      
      const usuario = reserva.usuario;
      if (!usuario || !usuario.id) return;
      
      const clienteId = usuario.id;
      
      if (!clientesMap.has(clienteId)) {
        const estadoCliente = this.determinarEstadoCliente(reserva);
        
        clientesMap.set(clienteId, {
          id: clienteId,
          nombre: usuario.nombre || '',
          apellidos: usuario.apellidos || '',
          nombreCompleto: getNombreCompleto(usuario),
          email: usuario.email || '',
          usuario: usuario.usuario || '',
          telefono: usuario.telefono || '',
          nacionalidad: usuario.nacionalidad || '',
          numPasaporte: usuario.numPasaporte || '',
          direccion: usuario.direccion || '',
          rol: usuario.roles,
          rolId: usuario.roles?.id,
          reservas: [this.mapearReservaCliente(reserva)],
          totalReservas: 1,
          totalGastado: reserva.estadoReserva === ESTADOS_RESERVA.PAGADA ? reserva.precioTotal : 0,
          ultimaReserva: new Date(reserva.fechaReserva),
          estado: estadoCliente,
          estadisticas: this.inicializarEstadisticas()
        });
      } else {
        const cliente = clientesMap.get(clienteId);
        cliente.reservas.push(this.mapearReservaCliente(reserva));
        cliente.totalReservas++;
        if (reserva.estadoReserva === ESTADOS_RESERVA.PAGADA) {
          cliente.totalGastado += reserva.precioTotal;
        }
        if (new Date(reserva.fechaReserva) > new Date(cliente.ultimaReserva)) {
          cliente.ultimaReserva = new Date(reserva.fechaReserva);
        }
        cliente.estado = this.actualizarEstadoCliente(cliente.reservas, cliente.estado);
      }
    });
    
    const clientes = Array.from(clientesMap.values());
    clientes.forEach(cliente => {
      cliente.estadisticas = this.calcularEstadisticasDetalladas(cliente.reservas);
    });
    
    return clientes;
  }
  
  private mapearReservaCliente(reserva: any): any {
    return {
      id: reserva.id,
      codigo: reserva.codigo || reserva.codigoReserva,
      fechaReserva: new Date(reserva.fechaReserva),
      fechaEntrada: new Date(reserva.fechaEntrada),
      fechaSalida: new Date(reserva.fechaSalida),
      numeroHuespedes: reserva.numeroHuespedes,
      precioTotal: reserva.precioTotal,
      pedidoEspecial: reserva.pedidoEspecial,
      estadoReserva: reserva.estadoReserva,
      hotel: {
        id: reserva.hotel?.id || reserva.hoteles?.id,
        nombre: reserva.hotel?.nombre || reserva.hoteles?.nombre,
        direccion: reserva.hotel?.direccion || reserva.hoteles?.direccion,
        telefono: reserva.hotel?.telefono || reserva.hoteles?.telefono,
        email: reserva.hotel?.email || reserva.hoteles?.email
      },
      habitacion: {
        id: reserva.habitacion?.id || reserva.habitaciones?.id,
        numero: reserva.habitacion?.numero || reserva.habitaciones?.numero,
        tipo: reserva.habitacion?.tipo || reserva.habitaciones?.tipo,
        precioNoche: reserva.habitacion?.precioNoche || reserva.habitaciones?.precioNoche || 0,
        capacidad: reserva.habitacion?.capacidad || reserva.habitaciones?.capacidad || 1
      },
      pagos: (reserva.pagos || []).map((pago: any) => ({
        id: pago.id,
        monto: pago.monto,
        fechaPago: new Date(pago.fechaPago),
        metodoPago: pago.metodoPago,
        estado: pago.estado,
        referencia: pago.referencia
      }))
    };
  }
  
  private determinarEstadoCliente(reserva: any): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrada = new Date(reserva.fechaEntrada);
    const salida = new Date(reserva.fechaSalida);
    
    if (entrada <= hoy && salida >= hoy) {
      return ESTADOS_CLIENTE.EN_CURSO;
    }
    if (salida < hoy) {
      return ESTADOS_CLIENTE.FINALIZADO;
    }
    if (entrada > hoy) {
      return ESTADOS_CLIENTE.PROXIMO;
    }
    return ESTADOS_CLIENTE.PENDIENTE;
  }
  
  private actualizarEstadoCliente(reservas: any[], estadoActual: string): string {
    if (estadoActual === ESTADOS_CLIENTE.EN_CURSO) {
      return estadoActual;
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const tieneEnCurso = reservas.some(r => {
      const entrada = new Date(r.fechaEntrada);
      const salida = new Date(r.fechaSalida);
      return entrada <= hoy && salida >= hoy;
    });
    
    if (tieneEnCurso) {
      return ESTADOS_CLIENTE.EN_CURSO;
    }
    
    const tieneFuturas = reservas.some(r => new Date(r.fechaEntrada) > hoy);
    if (tieneFuturas) {
      return ESTADOS_CLIENTE.PROXIMO;
    }
    
    return estadoActual;
  }
  
  private inicializarEstadisticas(): any {
    return {
      reservasConfirmadas: 0,
      reservasPendientes: 0,
      reservasPagadas: 0,
      reservasCanceladas: 0,
      nochesTotales: 0,
      habitacionesFavoritas: [],
      hotelesVisitados: 0,
      promedioGasto: 0,
      ultimoCheckIn: null,
      ultimoCheckOut: null
    };
  }
  
  private calcularEstadisticasDetalladas(reservas: any[]): any {
    const stats = this.inicializarEstadisticas();
    const hotelesSet = new Set<number>();
    const habitacionesCount = new Map<string, number>();
    let totalNoches = 0;
    let totalGasto = 0;
    
    reservas.forEach(reserva => {
      switch (reserva.estadoReserva) {
        case ESTADOS_RESERVA.CONFIRMADA:
          stats.reservasConfirmadas++;
          break;
        case ESTADOS_RESERVA.PENDIENTE:
          stats.reservasPendientes++;
          break;
        case ESTADOS_RESERVA.PAGADA:
          stats.reservasPagadas++;
          totalGasto += reserva.precioTotal;
          break;
        case ESTADOS_RESERVA.CANCELADA:
          stats.reservasCanceladas++;
          break;
      }
      
      const noches = this.calcularNoches(reserva.fechaEntrada, reserva.fechaSalida);
      totalNoches += noches;
      
      if (reserva.hotel?.id) {
        hotelesSet.add(reserva.hotel.id);
      }
      
      const habKey = `${reserva.habitacion?.tipo || 'desconocido'}`;
      habitacionesCount.set(habKey, (habitacionesCount.get(habKey) || 0) + 1);
      
      const hoy = new Date();
      if (new Date(reserva.fechaEntrada) <= hoy && new Date(reserva.fechaSalida) >= hoy) {
        stats.ultimoCheckIn = new Date(reserva.fechaEntrada);
        stats.ultimoCheckOut = new Date(reserva.fechaSalida);
      }
    });
    
    stats.nochesTotales = totalNoches;
    stats.hotelesVisitados = hotelesSet.size;
    stats.promedioGasto = stats.reservasPagadas > 0 ? totalGasto / stats.reservasPagadas : 0;
    
    stats.habitacionesFavoritas = Array.from(habitacionesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tipo]) => tipo);
    
    return stats;
  }
  
  private calcularNoches(fechaEntrada: Date, fechaSalida: Date): number {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diff = salida.getTime() - entrada.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
  
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'Ha ocurrido un error en el servicio';
      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else if (error.status) {
        switch (error.status) {
          case 400: errorMessage = 'Solicitud incorrecta'; break;
          case 401: errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente'; break;
          case 403: errorMessage = 'No tienes permisos para realizar esta acción'; break;
          case 404: errorMessage = 'Recurso no encontrado'; break;
          case 500: errorMessage = 'Error interno del servidor'; break;
          default: errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
      }
      
      console.error('Error details:', { operation, errorMessage, error });
      return of(result as T);
    };
  }
}