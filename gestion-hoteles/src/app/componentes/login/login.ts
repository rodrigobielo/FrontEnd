import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Credenciales, RespuestaLogin } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  credentials: Credenciales = {
    email: '',
    contrasena: ''
  };

  cargando: boolean = false;
  mensajeError: string = '';

  private router = inject(Router);
  private authService = inject(AuthService);

  onIrARegistro(): void {
    this.router.navigate(['/registro']);
  }

  onSubmit(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.mensajeError = '';

    // Usar el servicio de autenticación
    this.authService.login(this.credentials).subscribe({
      next: (response: RespuestaLogin) => {
        this.cargando = false;
        
        if (response.success) {
          // Guardar usuario en localStorage a través del servicio
          const usuario = {
            ...response.usuario,
            token: response.token
          };
          
          localStorage.setItem('usuarioTurismo', JSON.stringify(usuario));
          
          // Redirigir a la página de inicio
          this.router.navigate(['/inicio']);
        } else {
          this.mensajeError = response.message || 'Error en la autenticación';
        }
      },
      error: (error: Error) => {
        this.cargando = false;
        console.error('Error en login:', error);
        
        // Mostrar mensajes de error específicos
        if (error.message.includes('Credenciales incorrectas') || error.message.includes('Usuario no encontrado')) {
          this.mensajeError = 'Email o contraseña incorrectos';
        } else if (error.message.includes('No se puede conectar')) {
          this.mensajeError = 'No se puede conectar con el servidor';
        } else {
          this.mensajeError = error.message || 'Error en el servidor. Intente más tarde';
        }
      }
    });
  }
}