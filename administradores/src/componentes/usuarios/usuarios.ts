import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';
import { RolService } from '../../servicios/rol.service';
import { Usuario, UsuarioDTO } from '../../modelos/usuario.model';
import { RolSimple } from '../../modelos/rol.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios implements OnInit, OnDestroy {
  usuarioForm: FormGroup;
  modoEdicion: boolean = false;
  guardando: boolean = false;
  cargando: boolean = false;
  cargandoRoles: boolean = false;
  
  roles: RolSimple[] = [];
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioEditando: Usuario | null = null;
  usuarioDetalles: Usuario | null = null;
  usuarioAEliminar: Usuario | null = null;
  
  totalUsuarios: number = 0;

  private detallesModalInstance: any;
  private confirmarModalInstance: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      apellidos: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9\s\+\-\(\)]{7,15}$/)
      ]],
      nacionalidad: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      numPasaporte: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      usuario: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      contrasena: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      rolId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
    this.initModales();
  }

  ngOnDestroy(): void {
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

  cargarRoles(): void {
    this.cargandoRoles = true;
    this.rolService.getAll().subscribe({
      next: (data: RolSimple[]) => {
        this.roles = data;
        this.cargandoRoles = false;
        console.log('Roles cargados:', this.roles);
        
        if (!this.modoEdicion && this.roles.length > 0) {
          this.usuarioForm.patchValue({
            rolId: this.roles[0].id
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
        this.cargandoRoles = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los roles desde el backend');
        
        this.roles = [
          { id: 1, nombre: 'Administrador' },
          { id: 2, nombre: 'Usuario' },
          { id: 3, nombre: 'Hotel Admin' }
        ];
      }
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    
    this.usuarioService.getAll().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
        this.totalUsuarios = this.usuarios.length;
        this.cargando = false;
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.cargando = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar los usuarios');
        this.usuarios = [];
        this.usuariosFiltrados = [];
        this.totalUsuarios = 0;
      }
    });
  }

  obtenerNombreRol(rolId: number): string {
    if (!rolId) return 'Sin rol';
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : `Rol ${rolId}`;
  }

  filtrarUsuarios(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    this.aplicarFiltros(filtro);
  }

  private aplicarFiltros(filtroTexto: string): void {
    let resultado = [...this.usuarios];
    
    if (filtroTexto) {
      resultado = resultado.filter(usuario =>
        usuario.nombre.toLowerCase().includes(filtroTexto) ||
        usuario.apellidos.toLowerCase().includes(filtroTexto) ||
        usuario.email.toLowerCase().includes(filtroTexto) ||
        usuario.usuario.toLowerCase().includes(filtroTexto) ||
        this.obtenerNombreRol(usuario.rolId).toLowerCase().includes(filtroTexto)
      );
    }
    
    this.usuariosFiltrados = resultado;
  }

  nuevoRegistro(): void {
    this.modoEdicion = false;
    this.usuarioEditando = null;
    
    const rolDefault = this.roles.length > 0 ? this.roles[0].id : '';
    
    this.usuarioForm.reset({
      nombre: '',
      apellidos: '',
      telefono: '',
      nacionalidad: '',
      numPasaporte: '',
      usuario: '',
      email: '',
      contrasena: '',
      rolId: rolDefault
    });
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
  }

  editarUsuario(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditando = usuario;
    
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      nacionalidad: usuario.nacionalidad,
      numPasaporte: usuario.numPasaporte,
      usuario: usuario.usuario,
      email: usuario.email,
      contrasena: usuario.contrasena,
      rolId: usuario.rolId
    });
    
    const formulario = document.querySelector('.col-lg-5');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  guardarUsuario(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });

    if (this.usuarioForm.invalid) {
      for (const key of Object.keys(this.usuarioForm.controls)) {
        const control = this.usuarioForm.get(key);
        if (control?.invalid) {
          const element = document.getElementById(key);
          if (element) {
            element.focus();
          }
          break;
        }
      }
      return;
    }

    this.guardando = true;
    
    const usuarioData: UsuarioDTO = this.usuarioForm.value;
    
    if (this.modoEdicion && this.usuarioEditando) {
      this.usuarioService.update(this.usuarioEditando.id, usuarioData).subscribe({
        next: (usuarioActualizado: Usuario) => {
          const index = this.usuarios.findIndex(u => u.id === usuarioActualizado.id);
          if (index !== -1) {
            this.usuarios[index] = usuarioActualizado;
          }
          this.aplicarFiltros('');
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Usuario actualizado',
            `El usuario "${usuarioData.nombre}" se ha actualizado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            'No se pudo actualizar el usuario. Por favor, intente nuevamente.'
          );
        }
      });
    } else {
      this.usuarioService.create(usuarioData).subscribe({
        next: (nuevoUsuario: Usuario) => {
          this.usuarios.unshift(nuevoUsuario);
          this.totalUsuarios = this.usuarios.length;
          this.aplicarFiltros('');
          this.guardando = false;
          this.nuevoRegistro();
          
          this.mostrarNotificacion('success', 
            'Usuario creado',
            `El usuario "${usuarioData.nombre}" se ha creado correctamente.`
          );
        },
        error: (error: any) => {
          console.error('Error al crear usuario:', error);
          this.guardando = false;
          this.mostrarNotificacion('error', 
            'Error',
            'No se pudo crear el usuario. Por favor, intente nuevamente.'
          );
        }
      });
    }
  }

  cancelarEdicion(): void {
    if (this.usuarioForm.dirty) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.nuevoRegistro();
      }
    } else {
      this.nuevoRegistro();
    }
  }

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
    if (!this.usuarioAEliminar) return;
    
    const usuarioAEliminar = this.usuarioAEliminar;
    this.usuarioService.delete(usuarioAEliminar.id).subscribe({
      next: () => {
        const index = this.usuarios.findIndex(u => u.id === usuarioAEliminar.id);
        if (index !== -1) {
          const nombreEliminado = usuarioAEliminar.nombre;
          this.usuarios.splice(index, 1);
          this.totalUsuarios = this.usuarios.length;
          this.aplicarFiltros('');
          
          if (this.confirmarModalInstance) {
            this.confirmarModalInstance.hide();
          }
          
          this.mostrarNotificacion('info', 
            'Usuario eliminado',
            `El usuario "${nombreEliminado}" ha sido eliminado correctamente.`
          );
        }
        this.usuarioAEliminar = null;
      },
      error: (error: any) => {
        console.error('Error al eliminar usuario:', error);
        this.mostrarNotificacion('error', 
          'Error',
          'No se pudo eliminar el usuario. Por favor, intente nuevamente.'
        );
      }
    });
  }

  private mostrarNotificacion(tipo: 'success' | 'info' | 'warning' | 'error', titulo: string, mensaje: string): void {
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    const iconos = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };
    
    alert(`${iconos[tipo]} ${titulo}\n\n${mensaje}`);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.usuarioForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) return '';
    
    const errors = control.errors;
    
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (errors['pattern']) {
      switch (fieldName) {
        case 'nombre':
        case 'apellidos':
          return 'Solo letras y espacios';
        case 'telefono':
          return 'Formato de teléfono inválido';
        case 'numPasaporte':
          return 'Solo letras y números sin espacios';
        case 'usuario':
          return 'Solo letras, números y guión bajo';
        default:
          return 'Formato inválido';
      }
    }
    
    if (errors['email']) {
      return 'Correo electrónico inválido';
    }
    
    return 'Valor inválido';
  }
}