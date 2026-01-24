import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { Credentials } from '../../modelos/credentials.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  credentials: Credentials = {
    email: '',
    contrasena: '',
    rememberMe: false
  };
  
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginError: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.redirectByRole(user.rol);
      }
    }
  }
  
  // Método para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  // Método para olvidó contraseña
  onForgotPassword(): void {
    alert('Por favor, contacte al administrador del sistema para recuperar su contraseña.');
  }
  
  // Método cuando se envía el formulario
  onSubmit(form: any): void {
    if (form.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        control.markAsTouched();
        control.markAsDirty();
      });
      return;
    }
    
    this.isLoading = true;
    this.loginError = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login exitoso');
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }
  
  // Manejar errores de login
  private handleLoginError(error: any): void {
    if (error.status === 0) {
      this.loginError = 'Error de conexión con el servidor. Verifique que el backend esté ejecutándose.';
    } else if (error.status === 401) {
      this.loginError = 'Email o contraseña incorrectos.';
    } else {
      this.loginError = `Error: ${error.message}`;
    }
  }
  
  // Redirigir según rol
  private redirectByRole(rol: string): void {
    const rolLower = rol.toLowerCase();
    
    if (rolLower === 'superadmin') {
      this.router.navigate(['/dashboard']);
    } else if (rolLower === 'adminhotel') {
      this.router.navigate(['/dashboard-hotel']);
    } else {
      this.router.navigate(['/perfil']);
    }
  }
  
  // Limpiar error
  clearError(): void {
    this.loginError = '';
  }
}