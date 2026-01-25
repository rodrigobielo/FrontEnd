import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Servicios
import { UsuarioService } from '../../servicios/usuario.service';
import { RolService } from '../../servicios/rol.service';

// Modelos
import { Usuario, UsuarioFormData } from '../../modelos/usuario.model';
import { Roles } from '../../modelos/roles.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios implements OnInit, OnDestroy, AfterViewInit {
  // Inyección de servicios
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private fb = inject(FormBuilder);
  
  // Formulario
  usuarioForm: FormGroup;
  
  // Variables de estado
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoRoles: boolean = false;
  filtroRol: number | null = null;
  filtroTexto: string = '';
  
  // Datos
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Roles[] = [];
  usuarioEditando: Usuario | null = null;
  usuarioDetalles: Usuario | null = null;
  usuarioAEliminar: Usuario | null = null;
  
  // Estadísticas
  totalUsuarios: number = 0;

  // Variables para modales
  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  @ViewChild('detallesModal') detallesModalRef!: ElementRef;
  @ViewChild('confirmarEliminarModal') confirmarModalRef!: ElementRef;

  constructor() {
    // Formulario de usuario con valores por defecto
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required]],
      nacionalidad: ['', [Validators.required]],
      numPasaporte: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      usuario: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rolId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  ngAfterViewInit(): void {
    this.initModales();
  }

  ngOnDestroy(): void {
    this.destroyModales();
  }

  private initModales(): void {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      if (this.detallesModalRef?.nativeElement) {
        this.detallesModalInstance = new (window as any).bootstrap.Modal(this.detallesModalRef.nativeElement);
      }
      if (this.confirmarModalRef?.nativeElement) {
        this.confirmarModalInstance = new (window as any).bootstrap.Modal(this.confirmarModalRef.nativeElement);
      }
    }
  }

  private destroyModales(): void {
    if (this.detallesModalInstance) {
      this.detallesModalInstance.dispose();
    }
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.dispose();
    }
  }

  // Método para obtener mensajes de error
  getErrorMessage(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es requerido';
    } else if (control.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `Debe tener al menos ${requiredLength} caracteres`;
    } else if (control.hasError('email')) {
      return 'Correo electrónico inválido';
    } else if (control.hasError('pattern')) {
      return 'Formato incorrecto';
    }
    
    return '';
  }

  // Cancelar edición
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.usuarioEditando = null;
    this.usuarioForm.reset();
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
  }

  // Cargar roles dinámicamente desde la base de datos
  cargarRoles(): void {
    this.cargandoRoles = true;
    this.rolService.getRoles().subscribe({
      next: (roles: Roles[]) => {
        this.roles = roles || [];
        this.cargandoRoles = false;
        console.log('Roles cargados:', this.roles);
      },
      error: (error: any) => {
        console.error('Error cargando roles:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los roles');
        this.cargandoRoles = false;
        this.roles = [];
      }
    });
  }

  // Cargar usuarios
  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = [...this.usuarios];
        this.totalUsuarios = this.usuarios.length;
        this.cargando = false;
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los usuarios');
        this.cargando = false;
        this.usuarios = [];
        this.usuariosFiltrados = [];
      }
    });
  }

  // Obtener nombre del rol
  obtenerNombreRol(rolId?: number): string {
    if (!rolId) return 'Sin rol asignado';
    
    const rol = this.roles.find(r => r.id === rolId);
    
    if (!rol) {
      console.warn(`Rol con ID ${rolId} no encontrado`);
      return 'Rol no encontrado';
    }
    
    return rol.nombre;
  }

  // Filtrar usuarios por texto
  filtrarUsuarios(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto = input.value.toLowerCase().trim();
    this.aplicarFiltros();
  }

  // Filtrar por rol - ACEPTA number | undefined
  filtrarPorRol(rolId: number | undefined): void {
    this.filtroRol = rolId === undefined || rolId === 0 ? null : rolId;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let resultado = [...this.usuarios];
    
    // Filtrar por rol
    if (this.filtroRol) {
      resultado = resultado.filter(u => u.roles?.id === this.filtroRol);
    }
    
    // Filtrar por texto
    if (this.filtroTexto) {
      resultado = resultado.filter(usuario =>
        usuario.nombre.toLowerCase().includes(this.filtroTexto) ||
        usuario.apellidos.toLowerCase().includes(this.filtroTexto) ||
        usuario.usuario.toLowerCase().includes(this.filtroTexto) ||
        usuario.email.toLowerCase().includes(this.filtroTexto) ||
        this.obtenerNombreRol(usuario.roles?.id).toLowerCase().includes(this.filtroTexto)
      );
    }
    
    this.usuariosFiltrados = resultado;
  }

  // Nuevo registro
  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.usuarioEditando = null;
    
    this.usuarioForm.reset({
      nombre: '',
      apellidos: '',
      telefono: '',
      nacionalidad: '',
      numPasaporte: '',
      contrasena: '',
      usuario: '',
      email: '',
      rolId: ''
    });
    
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
  }

  // Editar usuario
  editarUsuario(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditando = usuario;
    
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
  }

  // Guardar usuario
  guardarUsuario(): void {
    // Marcar todos los controles como tocados para mostrar errores
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });

    if (this.usuarioForm.invalid) {
      this.mostrarNotificacion('error', 
        'Formulario inválido', 
        'Completa todos los campos requeridos correctamente.'
      );
      return;
    }

    // Verificar que haya roles disponibles
    if (this.roles.length === 0) {
      this.mostrarNotificacion('error', 
        'Error', 
        'No hay roles disponibles en la base de datos.'
      );
      return;
    }

    this.guardando = true;
    const usuarioData = this.usuarioForm.value;

    // Usar aserción no nula para id en modo edición
    if (this.modoEdicion && this.usuarioEditando && this.usuarioEditando.id !== undefined) {
      this.usuarioService.update(this.usuarioEditando.id!, usuarioData).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Usuario actualizado',
            `Usuario "${usuarioData.nombre}" actualizado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error actualizando usuario:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo actualizar el usuario. Intenta nuevamente.'
          );
        }
      });
    } else {
      this.usuarioService.create(usuarioData).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.guardando = false;
          this.nuevoRegistro();
          this.mostrarNotificacion('success', 
            'Usuario creado',
            `Usuario "${usuarioData.nombre}" creado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error creando usuario:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error', 
            'No se pudo crear el usuario. Intenta nuevamente.'
          );
        }
      });
    }
  }

  // Método para ver detalles de un usuario
  verDetalles(usuario: Usuario): void {
    this.usuarioDetalles = usuario;
    if (this.detallesModalInstance) {
      this.detallesModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('detallesModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para preparar la eliminación de un usuario
  eliminarUsuario(usuario: Usuario): void {
    this.usuarioAEliminar = usuario;
    if (this.confirmarModalInstance) {
      this.confirmarModalInstance.show();
    } else {
      // Fallback si no se inicializó el modal
      const modalElement = document.getElementById('confirmarEliminarModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  // Método para confirmar la eliminación
  confirmarEliminar(): void {
    if (!this.usuarioAEliminar || this.usuarioAEliminar.id === undefined) {
      this.mostrarNotificacion('error', 'Error', 'No se puede eliminar el usuario porque no tiene un ID válido.');
      return;
    }

    this.guardando = true;
    
    // Usar aserción no nula para id
    this.usuarioService.delete(this.usuarioAEliminar.id!).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarNotificacion('success', 
          'Usuario eliminado', 
          `El usuario "${this.usuarioAEliminar!.nombre}" ha sido eliminado correctamente.`
        );
        this.cargarUsuarios(); // Recargar la lista
        
        if (this.confirmarModalInstance) {
          this.confirmarModalInstance.hide();
        }
        this.usuarioAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error eliminando usuario:', error);
        this.guardando = false;
        this.mostrarNotificacion('error', 
          'Error', 
          'No se pudo eliminar el usuario. Intenta nuevamente.'
        );
      }
    });
  }

  // Mostrar notificación
  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    const toastId = 'notification-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-bg-${tipo === 'error' ? 'danger' : tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const iconos = {
      success: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      error: 'bi-x-circle-fill'
    };
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${iconos[tipo]} me-2"></i>
          <strong>${titulo}</strong><br>
          <small>${mensaje}</small>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    const container = document.querySelector('.toast-container') || (() => {
      const newContainer = document.createElement('div');
      newContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      newContainer.style.zIndex = '1055';
      document.body.appendChild(newContainer);
      return newContainer;
    })();
    
    container.appendChild(toast);
    const bsToast = new (window as any).bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  }
}