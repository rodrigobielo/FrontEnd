import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Login {
  @Output() cerrar = new EventEmitter<void>();
  @Output() cambiarARegistro = new EventEmitter<void>();
  
  usuario: string = '';
  password: string = '';
  mostrarPassword: boolean = false;
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = 'success';
  
  onSubmit(): void {
    this.cargando = true;
    
    // Simulación de login
    setTimeout(() => {
      this.cargando = false;
      
      if (this.usuario && this.password) {
        this.mensaje = '¡Inicio de sesión exitoso!';
        this.tipoMensaje = 'success';
        
        // Cerrar modal después de éxito
        setTimeout(() => {
          this.cerrar.emit();
        }, 1500);
      } else {
        this.mensaje = 'Por favor, complete todos los campos';
        this.tipoMensaje = 'danger';
      }
    }, 2000);
  }
  
  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }
  
  limpiarFormulario(): void {
    this.usuario = '';
    this.password = '';
    this.mensaje = '';
  }
  
  onCerrar(): void {
    this.cerrar.emit();
  }
  
  onIrARegistro(): void {
    this.cambiarARegistro.emit();
  }
}