// empleados.component.ts - Versión corregida
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

// Servicios
import { EmpleadoService } from '../../servicios/empleado.service';
import { UsuarioService } from '../../servicios/usuario.service';
import { HotelService } from '../../servicios/hotel.service';

// Modelos
import { EmpleadoResponse, EmpleadoCreate, Empleado } from '../../modelos/empleado.model';
import { Usuario, UsuarioResponse } from '../../modelos/usuario.model';
import { Hotel } from '../../modelos/hotel.model';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class Empleados implements OnInit, OnDestroy {
  // Formulario
  empleadoForm: FormGroup;
  
  // Estados
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoUsuarios: boolean = false;
  cargandoHoteles: boolean = false;
  formularioVisible: boolean = false;
  
  // Datos - Usar UsuarioResponse[] en lugar de Usuario[]
  empleados: EmpleadoResponse[] = [];
  empleadosFiltrados: EmpleadoResponse[] = [];
  usuariosDisponibles: UsuarioResponse[] = [];  // ← Cambiado a UsuarioResponse[]
  hoteles: Hotel[] = [];
  empleadoAEliminar: EmpleadoResponse | null = null;
  
  // Estadísticas
  totalEmpleados: number = 0;
  
  // Filtros
  filtroHotelId: number | null = null;
  filtroTexto: string = '';
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  
  // Mensajes
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Temporizadores
  private timeoutExito: any;
  private timeoutError: any;
  private timeoutInfo: any;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private usuarioService: UsuarioService,
    private hotelService: HotelService
  ) {
    this.empleadoForm = this.fb.group({
      idUsuario: ['', Validators.required],
      idHotel: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarUsuarios();
    this.cargarHoteles();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
  }

  private limpiarTemporizadores(): void {
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    if (this.timeoutError) clearTimeout(this.timeoutError);
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
  }

  private mostrarExito(mensaje: string): void {
    this.mostrarMensajeExito = true;
    this.mensajeExito = mensaje;
    if (this.timeoutExito) clearTimeout(this.timeoutExito);
    this.timeoutExito = setTimeout(() => {
      this.mostrarMensajeExito = false;
      this.mensajeExito = '';
    }, 4000);
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensajeError = true;
    this.mensajeError = mensaje;
    if (this.timeoutError) clearTimeout(this.timeoutError);
    this.timeoutError = setTimeout(() => {
      this.mostrarMensajeError = false;
      this.mensajeError = '';
    }, 5000);
  }

  private mostrarInfo(mensaje: string): void {
    this.mostrarMensajeInfo = true;
    this.mensajeInfo = mensaje;
    if (this.timeoutInfo) clearTimeout(this.timeoutInfo);
    this.timeoutInfo = setTimeout(() => {
      this.mostrarMensajeInfo = false;
      this.mensajeInfo = '';
    }, 3000);
  }

  /**
   * Cargar todos los empleados
   */
  cargarEmpleados(): void {
    this.cargando = true;
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados: EmpleadoResponse[]) => {
        this.empleados = empleados || [];
        this.aplicarFiltros();
        this.totalEmpleados = this.empleados.length;
        this.cargando = false;
        this.paginaActual = 1;
        
        if (empleados.length === 0) {
          this.mostrarInfo('No se encontraron empleados registrados');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar empleados', error);
        this.cargando = false;
        this.mostrarError(error.message || 'Error al cargar los empleados');
        this.empleados = [];
        this.empleadosFiltrados = [];
      }
    });
  }

  /**
   * Cargar todos los usuarios
   * SOLUCIÓN: Cambiar el tipo a UsuarioResponse[]
   */
  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: UsuarioResponse[]) => {  // ← Cambiado a UsuarioResponse[]
        this.usuariosDisponibles = usuarios || [];
        this.cargandoUsuarios = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios', error);
        this.mostrarError(error.message || 'Error al cargar los usuarios');
        this.cargandoUsuarios = false;
        this.usuariosDisponibles = [];
      }
    });
  }

  /**
   * Cargar todos los hoteles
   */
  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.cargandoHoteles = false;
      },
      error: (error: any) => {
        console.error('Error al cargar hoteles', error);
        this.mostrarError(error.message || 'Error al cargar los hoteles');
        this.cargandoHoteles = false;
        this.hoteles = [];
      }
    });
  }

  /**
   * Mostrar el formulario para crear nuevo empleado
   */
  mostrarFormulario(): void {
    if (this.usuariosDisponibles.length === 0) {
      this.mostrarError('No hay usuarios disponibles. Debes crear usuarios primero.');
      return;
    }
    if (this.hoteles.length === 0) {
      this.mostrarError('No hay hoteles disponibles. Debes crear hoteles primero.');
      return;
    }
    
    this.formularioVisible = true;
    this.empleadoForm.reset();
    this.empleadoForm.markAsPristine();
    this.empleadoForm.markAsUntouched();
  }

  /**
   * Cerrar el formulario
   */
  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.empleadoForm.reset();
  }

  /**
   * Filtrar empleados por texto
   */
  filtrarEmpleados(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
    this.paginaActual = 1;
  }

  /**
   * Filtrar empleados por hotel
   */
  filtrarPorHotel(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroHotelId = select.value ? parseInt(select.value) : null;
    this.aplicarFiltros();
    this.paginaActual = 1;
  }

  /**
   * Aplicar todos los filtros
   */
  private aplicarFiltros(): void {
    let resultado = [...this.empleados];
    
    if (this.filtroHotelId) {
      resultado = resultado.filter(e => e.hotel?.id === this.filtroHotelId);
    }
    
    if (this.filtroTexto) {
      resultado = resultado.filter(empleado =>
        empleado.usuario?.nombre?.toLowerCase().includes(this.filtroTexto) ||
        empleado.usuario?.apellidos?.toLowerCase().includes(this.filtroTexto) ||
        empleado.usuario?.usuario?.toLowerCase().includes(this.filtroTexto) ||
        empleado.usuario?.email?.toLowerCase().includes(this.filtroTexto) ||
        empleado.hotel?.nombre?.toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.empleadosFiltrados = resultado;
  }

  /**
   * Verificar si un usuario ya es empleado
   */
  private isUsuarioEmpleado(usuarioId: number | undefined): boolean {
    if (!usuarioId) return false;
    return this.empleados.some(emp => emp.usuario?.id === usuarioId);
  }

  /**
   * Obtener usuarios que no son empleados
   * SOLUCIÓN: Filtrar usuarios con ID válido
   */
  getUsuariosNoEmpleados(): UsuarioResponse[] {  // ← Cambiado a UsuarioResponse[]
    return this.usuariosDisponibles.filter(usuario => {
      const usuarioId = usuario.id;
      return usuarioId !== undefined && !this.isUsuarioEmpleado(usuarioId);
    });
  }

  /**
   * Guardar nuevo empleado
   */
  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      Object.keys(this.empleadoForm.controls).forEach(key => {
        this.empleadoForm.get(key)?.markAsTouched();
      });
      this.mostrarError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.guardando = true;
    const formValue = this.empleadoForm.value;
    
    const idUsuario = Number(formValue.idUsuario);
    const idHotel = Number(formValue.idHotel);
    
    if (isNaN(idUsuario) || isNaN(idHotel) || idUsuario <= 0 || idHotel <= 0) {
      this.mostrarError('Debe seleccionar un usuario y un hotel válidos');
      this.guardando = false;
      return;
    }
    
    const nuevoEmpleado: EmpleadoCreate = {
      usuario: { id: idUsuario },
      hotel: { id: idHotel }
    };
    
    const usuarioSeleccionado = this.usuariosDisponibles.find(u => u.id === idUsuario);
    const hotelSeleccionado = this.hoteles.find(h => h.id === idHotel);
    const nombreEmpleado = usuarioSeleccionado ? `${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellidos}` : 'Empleado';

    this.empleadoService.crearEmpleado(nuevoEmpleado).subscribe({
      next: (nuevoEmpleadoCreado: EmpleadoResponse) => {
        this.cargarEmpleados();
        this.cargarUsuarios();
        this.guardando = false;
        this.cerrarFormulario();
        this.mostrarExito(`✅ Empleado "${nombreEmpleado}" asignado al hotel "${hotelSeleccionado?.nombre || 'Hotel'}" correctamente`);
        this.paginaActual = 1;
      },
      error: (error: any) => {
        console.error('Error al crear empleado', error);
        this.guardando = false;
        let mensajeError = 'Error al asignar el empleado';
        if (error.error && typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.message) {
          mensajeError = error.message;
        }
        this.mostrarError(mensajeError);
      }
    });
  }

  /**
   * Preparar eliminación de empleado
   */
  eliminarEmpleado(empleado: EmpleadoResponse): void {
    if (!empleado.idEmpleado) {
      this.mostrarError('No se puede eliminar: ID de empleado no válido');
      return;
    }
    this.empleadoAEliminar = empleado;
    const modalElement = document.getElementById('confirmarEliminarModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  /**
   * Confirmar eliminación de empleado
   */
  confirmarEliminar(): void {
    if (!this.empleadoAEliminar || !this.empleadoAEliminar.idEmpleado) {
      this.mostrarError('No se puede eliminar: ID de empleado no válido');
      this.empleadoAEliminar = null;
      
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
      return;
    }
    
    const empleadoId: number = this.empleadoAEliminar.idEmpleado;
    const nombreEmpleado = `${this.empleadoAEliminar.usuario?.nombre || ''} ${this.empleadoAEliminar.usuario?.apellidos || ''}`.trim() || 'Empleado';
    
    this.empleadoService.eliminarEmpleado(empleadoId).subscribe({
      next: () => {
        const index = this.empleados.findIndex(e => e.idEmpleado === empleadoId);
        if (index !== -1) {
          this.empleados.splice(index, 1);
          this.aplicarFiltros();
          this.totalEmpleados = this.empleados.length;
        }
        
        const modalElement = document.getElementById('confirmarEliminarModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
        
        this.cargarUsuarios();
        this.mostrarExito(`🗑️ Empleado "${nombreEmpleado}" eliminado correctamente`);
        
        if (this.empleados.length === 0) {
          this.mostrarInfo('No hay empleados registrados');
        }
      },
      error: (error: any) => {
        console.error('Error al eliminar empleado', error);
        this.mostrarError(error.message || 'Error al eliminar el empleado');
        
        const modalElement = document.getElementById('confirmarEliminarModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
      }
    });
    
    this.empleadoAEliminar = null;
  }

  /**
   * Obtener nombre del hotel por ID
   */
  getNombreHotel(idHotel: number): string {
    const hotel = this.hoteles.find(h => h.id === idHotel);
    return hotel ? hotel.nombre : 'Hotel no encontrado';
  }
}