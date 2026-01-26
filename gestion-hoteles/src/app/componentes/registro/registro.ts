import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RegistroService } from '../../servicios/registro.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  isLoading: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  usarDebugEndpoint: boolean = false; // Cambiar a true para probar el endpoint de debug

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,80}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,20}$/)]],
      nacionalidad: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/)]],
      numPasaporte: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{5,20}$/)]],
      usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{4,20}$/)]],
      contrasena: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: this.contrasenasCoinciden });
  }

  ngOnInit(): void {}

  contrasenasCoinciden(g: FormGroup) {
    const pass = g.get('contrasena')?.value;
    const confirmPass = g.get('confirmarContrasena')?.value;
    return pass === confirmPass ? null : { contrasenasNoCoinciden: true };
  }

  get f() {
    return this.registroForm.controls;
  }

  campoValido(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return control ? control.valid && (control.dirty || control.touched) : false;
  }

  campoInvalido(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  mostrarError(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  limpiarFormulario(): void {
    this.registroForm.reset();
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  onIrALogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      Object.keys(this.registroForm.controls).forEach(key => {
        const control = this.registroForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Opción 1: Enviar con estructura de roles
    const usuarioConRol = {
      nombre: this.registroForm.value.nombre,
      apellidos: this.registroForm.value.apellidos,
      telefono: this.registroForm.value.telefono,
      nacionalidad: this.registroForm.value.nacionalidad,
      numPasaporte: this.registroForm.value.numPasaporte,
      usuario: this.registroForm.value.usuario,
      contrasena: this.registroForm.value.contrasena,
      email: this.registroForm.value.email,
      roles: { id: 3 }
    };

    // Opción 2: Enviar solo ID del rol
    const usuarioConIdRol = {
      nombre: this.registroForm.value.nombre,
      apellidos: this.registroForm.value.apellidos,
      telefono: this.registroForm.value.telefono,
      nacionalidad: this.registroForm.value.nacionalidad,
      numPasaporte: this.registroForm.value.numPasaporte,
      usuario: this.registroForm.value.usuario,
      contrasena: this.registroForm.value.contrasena,
      email: this.registroForm.value.email,
      idRol: 3
    };

    console.log('Datos a enviar:', usuarioConRol);

    // Elegir qué método usar
    const observable = this.usarDebugEndpoint 
      ? this.registroService.registrarUsuarioDebug(usuarioConRol)
      : this.registroService.registrarUsuario(usuarioConRol);

    observable.subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this.isLoading = false;
        this.mensajeExito = '¡Registro exitoso! Ahora puede iniciar sesión.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.isLoading = false;
        
        // Mensajes más específicos
        if (error.message.includes('Código: 0')) {
          this.mensajeError = 'No se puede conectar al servidor. Verifica: 1) Backend corriendo, 2) Puerto 8765, 3) CORS configurado';
        } else if (error.message.includes('Código: 500')) {
          this.mensajeError = 'Error interno del servidor (500). Revisa los logs del backend Spring Boot. Posible problema: estructura del campo "roles"';
        } else {
          this.mensajeError = error.message;
        }
        
        // Sugerir probar con endpoint de debug
        if (!this.usarDebugEndpoint && error.message.includes('500')) {
          this.mensajeError += '\n\n¿Quieres probar con el endpoint de debugging?';
        }
      }
    });
  }
}