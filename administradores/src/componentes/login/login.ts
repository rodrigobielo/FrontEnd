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
  // Credenciales usando el modelo actualizado
  credentials: Credentials = {
    nombre: '',          // Campo 'nombre' según entidad Usuarios
    contrasena: '',      // Campo 'contrasena' según entidad Usuarios
    rememberMe: false
  };
  
  // Variables de estado
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginError: string = '';
  debugInfo: string = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { 
    console.log('LoginComponent inicializado');
  }
  
  ngOnInit(): void {
    console.log('LoginComponent.ngOnInit()');
    
    // Si ya está autenticado, redirigir según rol
    if (this.authService.isAuthenticated()) {
      console.log('Usuario ya autenticado, redirigiendo...');
      const user = this.authService.getCurrentUser();
      if (user) {
        console.log('Usuario encontrado en almacenamiento:', user);
        this.redirectByRole(user.rol);
      }
    }
    
    // Cargar usuario recordado si existe
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      this.credentials.nombre = rememberedUser;
      this.credentials.rememberMe = true;
      console.log('Usuario recordado cargado:', rememberedUser);
    }
    
    // Mostrar estado actual
    this.authService.debugEstado();
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const contrasenaInput = document.getElementById('contrasena') as HTMLInputElement;
    if (contrasenaInput) {
      contrasenaInput.type = this.showPassword ? 'text' : 'password';
    }
  }
  
  onSubmit(form: any): void {
    console.log('Formulario enviado:', this.credentials);
    
    // Validar formulario
    if (form.invalid) {
      console.log('Formulario inválido');
      Object.keys(form.controls).forEach(key => {
        const control = form.controls[key];
        control.markAsTouched();
        control.markAsDirty();
      });
      return;
    }
    
    // Iniciar proceso de login
    this.isLoading = true;
    this.loginError = '';
    this.debugInfo = '';
    
    console.log('Iniciando proceso de login...');
    
    // Guardar usuario si "Recordar mis datos" está activado
    if (this.credentials.rememberMe) {
      localStorage.setItem('rememberedUser', this.credentials.nombre);
      console.log('Usuario guardado para recordar:', this.credentials.nombre);
    } else {
      localStorage.removeItem('rememberedUser');
    }
    
    // **VERSIÓN CON BACKEND REAL**
    console.log('Llamando a authService.login()...');
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso - respuesta completa:', response);
        this.isLoading = false;
        this.debugInfo = 'Login exitoso. Redirigiendo...';
      },
      error: (error) => {
        console.error('Error en login - detalles:', error);
        this.isLoading = false;
        this.handleLoginError(error);
        this.debugInfo = `Error ${error.status}: ${error.message}`;
      },
      complete: () => {
        console.log('Login process completed');
      }
    });
    
    // **VERSIÓN DE SIMULACIÓN (COMENTAR CUANDO EL BACKEND FUNCIONE)**
    /*
    setTimeout(() => {
      this.isLoading = false;
      
      // Simulación simple para desarrollo
      if (this.credentials.nombre === 'admin' && this.credentials.contrasena === 'admin123') {
        console.log('Credenciales de prueba correctas');
        
        // Crear usuario mock
        const mockUser = {
          id: 1,
          nombre: 'Admin',
          apellidos: 'Sistema',
          telefono: '123456789',
          nacionalidad: 'Española',
          numPasaporte: 'ABC123456',
          rol: 'superAdmin'
        };
        
        // Guardar en localStorage para simular
        localStorage.setItem('current_user', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'mock-token-123456');
        
        console.log('Usuario mock guardado, redirigiendo...');
        this.router.navigate(['/dashboard'])
          .then(success => {
            if (!success) {
              console.error('No se pudo redirigir, usando window.location');
              window.location.href = '/dashboard';
            }
          });
      } else {
        this.loginError = 'Para desarrollo usar: admin / admin123';
        console.log('Credenciales incorrectas');
      }
    }, 1000);
    */
  }
  
  onForgotPassword(): void {
    alert('Por favor, contacte al administrador del sistema para recuperar su contraseña.\n\nEmail: admin@sistema.com\nTeléfono: +1 234 567 890');
  }
  
  private handleLoginError(error: any): void {
    console.error('Error detallado en login:', error);
    
    // Manejar diferentes tipos de error
    if (error.status === 0 || error.message?.includes('conexión')) {
      this.loginError = `
        ERROR DE CONEXIÓN:
        
        No se pudo conectar con el servidor Spring Boot.
        
        Verifique que:
        1. El servidor Spring Boot esté ejecutándose
        2. Esté en el puerto 8765
        3. La URL http://localhost:8765/Usuarios/Listar sea accesible
        
        Para desarrollo rápido, puede usar las credenciales:
        Usuario: admin
        Contraseña: admin123
      `;
    } else if (error.status === 401 || error.message?.includes('Credenciales')) {
      this.loginError = 'Nombre de usuario o contraseña incorrectos.';
    } else if (error.status === 404) {
      this.loginError = `
        Endpoint no encontrado: ${error.url}
        
        Verifique que el backend tenga el endpoint /Usuarios/Listar
      `;
    } else {
      this.loginError = `
        Error del servidor: ${error.message}
        
        Detalles: ${JSON.stringify(error.originalError || error)}
      `;
    }
  }
  
  private redirectByRole(rol: string): void {
    console.log('Redirigiendo por rol:', rol);
    
    if (rol?.toLowerCase().includes('admin')) {
      console.log('Redirigiendo a dashboard...');
      this.router.navigate(['/dashboard'])
        .then(success => {
          if (!success) {
            console.error('No se pudo redirigir a dashboard');
            window.location.href = '/dashboard';
          }
        });
    } else {
      console.log('Redirigiendo a perfil...');
      this.router.navigate(['/perfil']);
    }
  }
  
  clearError(): void {
    this.loginError = '';
    this.debugInfo = '';
  }
  
  // Método para debug
  testBackendConnection(): void {
    console.log('Probando conexión con backend...');
    this.debugInfo = 'Probando conexión...';
    
    fetch('http://localhost:8765/Usuarios/Listar')
      .then(response => {
        this.debugInfo = `Status: ${response.status} ${response.statusText}`;
        console.log('Response:', response);
        return response.json();
      })
      .then(data => {
        console.log('Datos recibidos:', data);
        this.debugInfo = `Conexión exitosa. Usuarios encontrados: ${data.length}`;
      })
      .catch(error => {
        console.error('Error en fetch:', error);
        this.debugInfo = `Error: ${error.message}`;
      });
  }
}