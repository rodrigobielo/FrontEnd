import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../servicios/registro.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  isLoading: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

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

  onIrALogin(): void {
    this.router.navigate(['/login']);
  }

  limpiarFormulario(): void {
    // Resetear el formulario
    this.registroForm.reset();
    
    // Limpiar mensajes
    this.mensajeExito = '';
    this.mensajeError = '';
    
    // Resetear estados de validación
    Object.keys(this.registroForm.controls).forEach(key => {
      const control = this.registroForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
    
    // También puedes resetear el estado de carga si es necesario
    this.isLoading = false;
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

    const usuario: any = {
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

    this.registroService.registrarUsuario(usuario).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.mensajeExito = '¡Registro exitoso! Redirigiendo...';
        
        // Crear objeto usuario para localStorage
        const usuarioRegistrado = {
          nombre: response.nombre,
          apellidos: response.apellidos,
          email: response.email,
          token: 'token-registro-' + Date.now()
        };
        
        // Guardar en localStorage
        localStorage.setItem('usuarioTurismo', JSON.stringify(usuarioRegistrado));
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en el registro:', error);
        
        if (error.status === 409 || error.status === 400) {
          this.mensajeError = 'El usuario o email ya están registrados.';
        } else if (error.status === 0) {
          this.mensajeError = 'No se puede conectar con el servidor.';
        } else {
          this.mensajeError = 'Hubo un error en el registro.';
        }
      }
    });
  }
}