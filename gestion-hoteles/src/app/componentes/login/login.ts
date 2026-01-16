import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <div class="row g-0">
        <!-- Columna izquierda con imagen -->
        <div class="col-md-6 d-none d-md-block">
          <div class="login-image h-100" 
               style="background: linear-gradient(rgba(26, 54, 93, 0.8), rgba(26, 54, 93, 0.8)), url('https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'); 
                      background-size: cover; background-position: center;">
            <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white p-5">
              <h2 class="fw-bold mb-4">Bienvenido de nuevo</h2>
              <p class="text-center">Descubre las maravillas de Guinea Ecuatorial. Inicia sesión para planificar tu próximo viaje.</p>
            </div>
          </div>
        </div>

        <!-- Columna derecha con formulario -->
        <div class="col-md-6 d-flex align-items-center">
          <div class="p-4 p-md-5 w-100">
            <h3 class="fw-bold mb-4" style="color: #1a365d;">Iniciar Sesión</h3>

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <div class="mb-3">
                <label for="email" class="form-label">Usuario</label>
                <input type="text" class="form-control" id="usuario" 
                       [(ngModel)]="credentials.usuario" name="usuario" 
                       placeholder="rodrigo" required>
                <div class="form-text">Usuario de prueba: rodrigo</div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" class="form-control" id="password" 
                       [(ngModel)]="credentials.password" name="password" 
                       placeholder="123456" required>
                <div class="form-text">Contraseña de prueba: 123456</div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberMe">
                  <label class="form-check-label" for="rememberMe">Recordarme</label>
                </div>
                <a href="#" class="text-decoration-none" style="color: #1a365d;">¿Olvidaste tu contraseña?</a>
              </div>

              <button type="submit" class="btn w-100 py-2 mb-3 fw-medium" 
                      [disabled]="loginForm.invalid"
                      style="background-color: #1a365d; color: white;">
                Iniciar Sesión
              </button>

              <div class="text-center mb-4">
                <span class="text-muted">¿No tienes una cuenta?</span>
                <button type="button" class="btn btn-link p-0 ms-1" (click)="cambiarARegistro.emit()" style="color: #1a365d;">
                  Regístrate aquí
                </button>
              </div>

              <div class="separator my-4">
                <span class="text-muted">O continúa con</span>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <button type="button" class="btn btn-outline-secondary w-100">
                    <i class="bi bi-google"></i> Google
                  </button>
                </div>
                <div class="col-6">
                  <button type="button" class="btn btn-outline-secondary w-100">
                    <i class="bi bi-facebook"></i> Facebook
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-image {
      min-height: 500px;
    }
  `]
})
export class Login {
  @Output() cerrar = new EventEmitter<void>();
  @Output() cambiarARegistro = new EventEmitter<void>();
  @Output() loginExitoso = new EventEmitter<any>();

  credentials = {
    usuario: '',
    password: ''
  };

  onSubmit() {
    // Usuario de prueba: rodrigo / 123456
    if (this.credentials.usuario === 'rodrigo' && this.credentials.password === '123456') {
      // Simular respuesta exitosa
      const usuario = {
        nombre: 'Rodrigo García',
        email: 'rodrigo@email.com',
        token: 'token-simulado-123'
      };
      
      console.log('✅ LOGIN: Credenciales correctas');
      this.loginExitoso.emit(usuario);
    } else {
      alert('Credenciales incorrectas. Usuario: rodrigo, Contraseña: 123456');
    }
  }
}