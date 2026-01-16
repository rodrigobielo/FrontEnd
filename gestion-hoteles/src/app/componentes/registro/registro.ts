import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <div class="row g-0">
        <!-- Columna izquierda con formulario -->
        <div class="col-md-6 d-flex align-items-center">
          <div class="p-4 p-md-5 w-100">
            <h3 class="fw-bold mb-4" style="color: #1a365d;">Crear Cuenta</h3>

            <form (ngSubmit)="onSubmit()" #registroForm="ngForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" 
                         [(ngModel)]="datos.nombre" name="nombre" 
                         placeholder="Juan" required>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="apellido" class="form-label">Apellido</label>
                  <input type="text" class="form-control" id="apellido" 
                         [(ngModel)]="datos.apellido" name="apellido" 
                         placeholder="Pérez" required>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" id="email" 
                       [(ngModel)]="datos.email" name="email" 
                       placeholder="juan@ejemplo.com" required>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" class="form-control" id="password" 
                       [(ngModel)]="datos.password" name="password" 
                       placeholder="••••••••" required>
              </div>

              <div class="mb-4">
                <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                <input type="password" class="form-control" id="confirmPassword" 
                       [(ngModel)]="datos.confirmPassword" name="confirmPassword" 
                       placeholder="••••••••" required>
              </div>

              <div class="form-check mb-4">
                <input class="form-check-input" type="checkbox" id="terminos" required>
                <label class="form-check-label" for="terminos">
                  Acepto los <a href="#" class="text-decoration-none" style="color: #1a365d;">Términos y Condiciones</a>
                </label>
              </div>

              <button type="submit" class="btn w-100 py-2 mb-3 fw-medium" 
                      [disabled]="registroForm.invalid"
                      style="background-color: #1a365d; color: white;">
                Registrarse
              </button>

              <div class="text-center">
                <span class="text-muted">¿Ya tienes una cuenta?</span>
                <button type="button" class="btn btn-link p-0 ms-1" 
                        (click)="cambiarALogin.emit()" 
                        style="color: #1a365d;">
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Columna derecha con imagen -->
        <div class="col-md-6 d-none d-md-block">
          <div class="registro-image h-100" 
               style="background: linear-gradient(rgba(26, 54, 93, 0.8), rgba(26, 54, 93, 0.8)), url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); 
                      background-size: cover; background-position: center;">
            <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white p-5">
              <h2 class="fw-bold mb-4">Únete a nuestra comunidad</h2>
              <p class="text-center">Regístrate para acceder a ofertas exclusivas y planificar el viaje perfecto por Guinea Ecuatorial.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registro-image {
      min-height: 600px;
    }
  `]
})
export class Registro {
  @Output() cerrar = new EventEmitter<void>();
  @Output() cambiarALogin = new EventEmitter<void>();
  @Output() registroExitoso = new EventEmitter<any>();

  datos = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onSubmit() {
    // Validar que las contraseñas coincidan
    if (this.datos.password !== this.datos.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Crear usuario
    const usuario = {
      nombre: `${this.datos.nombre} ${this.datos.apellido}`,
      email: this.datos.email
    };

    console.log('✅ REGISTRO: Usuario creado');
    this.registroExitoso.emit(usuario);
  }
}