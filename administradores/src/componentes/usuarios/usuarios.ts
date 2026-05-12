import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

// Servicios
import { UsuarioService } from '../../servicios/usuario.service';
import { RolService } from '../../servicios/rol.service';
import { HotelService } from '../../servicios/hotel.service';

// Modelos
import { Usuario, UsuarioCompletoResponse, mapCompletoToUsuario } from '../../modelos/usuario.model';
import { Roles } from '../../modelos/roles.model';
import { Hotel } from '../../modelos/hotel.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios implements OnInit, OnDestroy {
  // Propiedades del formulario
  usuarioForm: FormGroup;
  empleadoForm: FormGroup;
  modoEdicion: boolean = false;
  esUsuarioEmpleado: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoRoles: boolean = false;
  cargandoHoteles: boolean = false;
  formularioVisible: boolean = false;
  
  // Datos de usuarios
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioEditando: Usuario | null = null;
  usuarioAEliminar: Usuario | null = null;
  usuarioDetalles: Usuario | null = null;
  
  // Roles y Hoteles
  roles: Roles[] = [];
  hoteles: Hotel[] = [];
  
  // Estadísticas
  totalUsuarios: number = 0;
  
  // Propiedades para paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  
  // Mensajes con toasts
  mensajeExito: string = '';
  mensajeError: string = '';
  mensajeInfo: string = '';
  mostrarMensajeExito: boolean = false;
  mostrarMensajeError: boolean = false;
  mostrarMensajeInfo: boolean = false;
  
  // Temporizadores para mensajes
  private timeoutExito: any;
  private timeoutError: any;
  private timeoutInfo: any;

  // Modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private hotelService: HotelService
  ) {
    // Inicializar formulario de usuario con validaciones
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{8,20}$/)]],
      nacionalidad: ['', [Validators.required, Validators.maxLength(50)]],
      numPasaporte: ['', [Validators.required, Validators.maxLength(20)]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      rolId: ['', [Validators.required]]
    });

    // Inicializar formulario de empleado
    this.empleadoForm = this.fb.group({
      hotelId: ['', [Validators.required]],
      rolEmpleado: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarHoteles();
    this.initModales();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizadores();
    this.destroyModales();
  }

  private initModales(): void {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const detallesElement = document.getElementById('detallesModal');
      const confirmarElement = document.getElementById('confirmarEliminarModal');
      
      if (detallesElement) {
        this.detallesModalInstance = new (window as any).bootstrap.Modal(detallesElement);
      }
      if (confirmarElement) {
        this.confirmarModalInstance = new (window as any).bootstrap.Modal(confirmarElement);
      }
    }
  }

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

  cargarRoles(): void {
    this.cargandoRoles = true;
    this.rolService.getRoles().subscribe({
      next: (roles: Roles[]) => {
        this.roles = roles || [];
        this.cargandoRoles = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar roles', error);
        this.mostrarError(error.message || 'Error al cargar los roles');
        this.cargandoRoles = false;
        this.roles = [];
      }
    });
  }

  cargarHoteles(): void {
    this.cargandoHoteles = true;
    this.hotelService.getHoteles().subscribe({
      next: (hoteles: Hotel[]) => {
        this.hoteles = hoteles || [];
        this.cargandoHoteles = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar hoteles', error);
        this.mostrarError(error.message || 'Error al cargar los hoteles');
        this.cargandoHoteles = false;
        this.hoteles = [];
      }
    });
  }

  // ✅ NUEVO: Cargar usuarios con detalles de empleado y hotel
  cargarUsuarios(): void {
    this.cargando = true;
    this.limpiarTemporizadores();
    
    // Usar el endpoint de usuarios empleados que trae toda la información
    this.usuarioService.getAllUsuariosEmpleados().subscribe({
      next: (response: any) => {
        let usuariosCompletos: UsuarioCompletoResponse[] = [];
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(response)) {
          usuariosCompletos = response;
        } else if (response.usuarios && Array.isArray(response.usuarios)) {
          usuariosCompletos = response.usuarios;
        } else if (response.data && Array.isArray(response.data)) {
          usuariosCompletos = response.data;
        }
        
        // Mapear los datos completos al formato Usuario
        this.usuarios = usuariosCompletos.map(completo => mapCompletoToUsuario(completo));
        this.usuariosFiltrados = [...this.usuarios];
        this.totalUsuarios = this.usuarios.length;
        this.cargando = false;
        this.paginaActual = 1;
        
        console.log('Usuarios cargados con hoteles:', this.usuarios);
        
        if (this.usuarios.length === 0) {
          this.mostrarInfo('No se encontraron usuarios registrados');
        }
      },
      error: (error: Error) => {
        console.error('Error al cargar usuarios con detalles', error);
        // Fallback: cargar usuarios normales
        this.cargarUsuariosNormales();
      }
    });
  }

  // Fallback: cargar usuarios normales
  private cargarUsuariosNormales(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = [...this.usuarios];
        this.totalUsuarios = this.usuarios.length;
        this.cargando = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar usuarios', error);
        this.cargando = false;
        this.mostrarError(error.message || 'Error al cargar los usuarios');
      }
    });
  }

  obtenerNombreRol(rolId?: number): string {
    if (!rolId) return 'Sin rol asignado';
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'Rol no encontrado';
  }

  // ✅ MEJORADO: Obtener nombre del hotel directamente del objeto usuario
  obtenerNombreHotel(usuario: Usuario): string {
    if (usuario.empleado?.hotel?.nombre) {
      return usuario.empleado.hotel.nombre;
    }
    return 'No empleado';
  }

  // Método para obtener el badge del hotel
  obtenerBadgeHotel(usuario: Usuario): string {
    if (usuario.empleado?.hotel?.nombre) {
      return `🏨 ${usuario.empleado.hotel.nombre}`;
    }
    return '👤 No empleado';
  }

  mostrarFormulario(tipo: 'normal' | 'empleado' = 'normal'): void {
    this.formularioVisible = true;
    this.modoEdicion = false;
    this.esUsuarioEmpleado = tipo === 'empleado';
    this.usuarioEditando = null;
    this.usuarioForm.reset();
    this.empleadoForm.reset();
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
    this.empleadoForm.markAsPristine();
    this.empleadoForm.markAsUntouched();
    
    if (this.esUsuarioEmpleado) {
      this.empleadoForm.patchValue({
        hotelId: '',
        rolEmpleado: ''
      });
    }
    
    this.limpiarTemporizadores();
  }

  cerrarFormulario(): void {
    this.formularioVisible = false;
    this.modoEdicion = false;
    this.esUsuarioEmpleado = false;
    this.usuarioEditando = null;
    this.usuarioForm.reset();
    this.empleadoForm.reset();
    this.limpiarTemporizadores();
  }

  filtrarUsuarios(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    if (filtro) {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(filtro) ||
        usuario.apellidos.toLowerCase().includes(filtro) ||
        usuario.usuario.toLowerCase().includes(filtro) ||
        usuario.email.toLowerCase().includes(filtro) ||
        this.obtenerNombreRol(usuario.roles?.id).toLowerCase().includes(filtro) ||
        (usuario.empleado?.hotel?.nombre?.toLowerCase().includes(filtro))
      );
      
      if (this.usuariosFiltrados.length === 0) {
        this.mostrarInfo(`No se encontraron usuarios con "${filtro}"`);
      }
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }
    
    this.paginaActual = 1;
  }

  editarUsuario(usuario: Usuario): void {
    this.modoEdicion = true;
    this.esUsuarioEmpleado = !!usuario.empleado;
    this.usuarioEditando = usuario;
    this.formularioVisible = true;
    this.limpiarTemporizadores();
    
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      contrasena: usuario.contrasena,
      usuario: usuario.usuario,
      email: usuario.email,
      rolId: usuario.roles?.id || ''
    });
    
    if (this.esUsuarioEmpleado && usuario.empleado) {
      this.empleadoForm.patchValue({
        hotelId: usuario.empleado.hotel?.id || '',
        rolEmpleado: usuario.empleado.rolEmpleado || ''
      });
    }
    
    this.usuarioForm.markAsPristine();
    Object.keys(this.usuarioForm.controls).forEach(key => {
      this.usuarioForm.get(key)?.markAsUntouched();
    });
    this.empleadoForm.markAsPristine();
    Object.keys(this.empleadoForm.controls).forEach(key => {
      this.empleadoForm.get(key)?.markAsUntouched();
    });
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const control = this.usuarioForm.get(key);
        control?.markAsTouched();
      });
      this.mostrarError('Por favor, complete correctamente todos los campos obligatorios del usuario.');
      return;
    }

    if (this.esUsuarioEmpleado && this.empleadoForm.invalid) {
      Object.keys(this.empleadoForm.controls).forEach(key => {
        const control = this.empleadoForm.get(key);
        if (key !== 'rolEmpleado') {
          control?.markAsTouched();
        }
      });
      this.mostrarError('Por favor, seleccione un hotel para el empleado.');
      return;
    }

    this.guardando = true;
    const usuarioData = this.usuarioForm.value;
    const nombreCompleto = `${usuarioData.nombre} ${usuarioData.apellidos}`;

    if (this.modoEdicion && this.usuarioEditando) {
      if (!this.usuarioEditando.id) {
        this.guardando = false;
        this.mostrarError('Error: No se pudo identificar el usuario a actualizar');
        return;
      }

      if (this.esUsuarioEmpleado && this.usuarioEditando) {
        const empleadoData = this.empleadoForm.value;
        const updateRequest = {
          nombre: usuarioData.nombre,
          apellidos: usuarioData.apellidos,
          telefono: usuarioData.telefono,
          nacionalidad: usuarioData.nacionalidad,
          numPasaporte: usuarioData.numPasaporte,
          usuario: usuarioData.usuario,
          email: usuarioData.email,
          hotelId: empleadoData.hotelId ? Number(empleadoData.hotelId) : null,
          rolEmpleado: empleadoData.rolEmpleado || null,
          rolId: usuarioData.rolId ? Number(usuarioData.rolId) : null
        };
        
        this.usuarioService.updateUsuarioEmpleado(this.usuarioEditando.id, updateRequest).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.guardando = false;
            this.cerrarFormulario();
            this.mostrarExito(`✅ Usuario empleado "${nombreCompleto}" actualizado correctamente`);
          },
          error: (error: Error) => {
            console.error('Error al actualizar usuario empleado', error);
            this.mostrarError(error.message || 'Error al actualizar el usuario');
            this.guardando = false;
          }
        });
      } else {
        this.usuarioService.update(this.usuarioEditando.id, usuarioData).subscribe({
          next: () => {
            this.cargarUsuarios();
            this.guardando = false;
            this.cerrarFormulario();
            this.mostrarExito(`✅ Usuario "${nombreCompleto}" actualizado correctamente`);
          },
          error: (error: Error) => {
            console.error('Error al actualizar usuario', error);
            this.guardando = false;
            this.mostrarError(error.message || 'Error al actualizar el usuario');
          }
        });
      }
    } else if (this.esUsuarioEmpleado) {
      const empleadoData = this.empleadoForm.value;
      const hotelId = empleadoData.hotelId ? Number(empleadoData.hotelId) : null;
      
      if (!hotelId) {
        this.guardando = false;
        this.mostrarError('Debe seleccionar un hotel válido');
        return;
      }
      
      const usuarioEmpleadoRequest = {
        nombre: usuarioData.nombre.trim(),
        apellidos: usuarioData.apellidos.trim(),
        telefono: usuarioData.telefono.trim(),
        nacionalidad: usuarioData.nacionalidad.trim(),
        numPasaporte: usuarioData.numPasaporte.trim(),
        contrasena: usuarioData.contrasena,
        usuario: usuarioData.usuario.trim().toLowerCase(),
        email: usuarioData.email.trim().toLowerCase(),
        hotelId: hotelId,
        rolEmpleado: empleadoData.rolEmpleado?.trim() || null,
        rolId: usuarioData.rolId ? Number(usuarioData.rolId) : null
      };
      
      this.usuarioService.createUsuarioEmpleado(usuarioEmpleadoRequest).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Usuario empleado "${nombreCompleto}" creado correctamente`);
          this.paginaActual = 1;
        },
        error: (error: Error) => {
          console.error('Error al crear usuario empleado', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al crear el usuario empleado');
        }
      });
    } else {
      const usuarioNormalRequest = {
        nombre: usuarioData.nombre,
        apellidos: usuarioData.apellidos,
        telefono: usuarioData.telefono,
        nacionalidad: usuarioData.nacionalidad,
        numPasaporte: usuarioData.numPasaporte,
        contrasena: usuarioData.contrasena,
        usuario: usuarioData.usuario,
        email: usuarioData.email,
        rolId: usuarioData.rolId ? Number(usuarioData.rolId) : 1
      };
      
      this.usuarioService.create(usuarioNormalRequest).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.guardando = false;
          this.cerrarFormulario();
          this.mostrarExito(`✅ Usuario "${nombreCompleto}" creado correctamente`);
          this.paginaActual = 1;
        },
        error: (error: Error) => {
          console.error('Error al crear usuario', error);
          this.guardando = false;
          this.mostrarError(error.message || 'Error al crear el usuario');
        }
      });
    }
  }

  // ✅ MEJORADO: Ver detalles con toda la información del hotel
  verDetalles(usuario: Usuario): void {
    this.usuarioDetalles = usuario;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    this.usuarioAEliminar = usuario;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    }
  }

  confirmarEliminar(): void {
    if (this.usuarioAEliminar && this.usuarioAEliminar.id) {
      const nombreCompleto = `${this.usuarioAEliminar.nombre} ${this.usuarioAEliminar.apellidos}`;
      
      // Si tiene empleado, usar eliminación completa
      if (this.usuarioAEliminar.empleado?.idEmpleado) {
        this.usuarioService.deleteUsuarioEmpleado(this.usuarioAEliminar.id).subscribe({
          next: () => {
            const index = this.usuarios.findIndex(u => u.id === this.usuarioAEliminar!.id);
            if (index !== -1) {
              this.usuarios.splice(index, 1);
              this.usuariosFiltrados = [...this.usuarios];
              this.totalUsuarios = this.usuarios.length;
            }
            
            if (this.confirmarModalInstance) {
              this.confirmarModalInstance.hide();
            }
            
            this.mostrarExito(`🗑️ Usuario "${nombreCompleto}" eliminado correctamente`);
          },
          error: (error: Error) => {
            console.error('Error al eliminar usuario empleado', error);
            this.mostrarError(error.message || 'Error al eliminar el usuario');
            if (this.confirmarModalInstance) {
              this.confirmarModalInstance.hide();
            }
          }
        });
      } else {
        this.usuarioService.delete(this.usuarioAEliminar.id).subscribe({
          next: () => {
            const index = this.usuarios.findIndex(u => u.id === this.usuarioAEliminar!.id);
            if (index !== -1) {
              this.usuarios.splice(index, 1);
              this.usuariosFiltrados = [...this.usuarios];
              this.totalUsuarios = this.usuarios.length;
            }
            
            if (this.confirmarModalInstance) {
              this.confirmarModalInstance.hide();
            }
            
            this.mostrarExito(`🗑️ Usuario "${nombreCompleto}" eliminado correctamente`);
          },
          error: (error: Error) => {
            console.error('Error al eliminar usuario', error);
            this.mostrarError(error.message || 'Error al eliminar el usuario');
            if (this.confirmarModalInstance) {
              this.confirmarModalInstance.hide();
            }
          }
        });
      }
    }
    this.usuarioAEliminar = null;
  }
}