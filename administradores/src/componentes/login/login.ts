// login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // Credenciales del usuario
  credentials = {
    usuario: '',
    password: '',
    rememberMe: false
  };
  
  // Variables de estado
  showPassword = false;
  isLoading = false;
  loginError = '';
  
  // Credenciales válidas
  private validUser = 'admin';
  private validPassword = 'password123';
  
  constructor(private router: Router) { }
  
  // Inicialización del componente
  ngOnInit(): void {
    // Limpiar sesión previa para forzar login
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  }
  
  // Método para alternar visibilidad de contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }
  
  // Método para manejar el envío del formulario
  onSubmit(form: any): void {
    // Marcar todos los campos como tocados para mostrar errores
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }
    
    // Iniciar proceso de login
    this.isLoading = true;
    this.loginError = '';
    
    // Simular petición a servidor
    setTimeout(() => {
      // Validar credenciales
      if (this.credentials.usuario === this.validUser && 
          this.credentials.password === this.validPassword) {
        
        // Guardar estado de sesión
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: this.credentials.usuario,
          name: 'Administrador',
          role: 'admin'
        }));
        
        // Guardar usuario si "Recordar mis datos" está activado
        if (this.credentials.rememberMe) {
          localStorage.setItem('rememberedUser', this.credentials.usuario);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        // Login exitoso - redirigir al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Credenciales incorrectas
        this.loginError = 'Usuario o contraseña incorrectos. Intente nuevamente.';
      }
      
      this.isLoading = false;
    }, 1000);
  }
}