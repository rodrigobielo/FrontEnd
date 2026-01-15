import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class Registro implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() cambiarALogin = new EventEmitter<void>();
  
  // Propiedades del formulario
  registroForm!: FormGroup;
  submitted = false;
  isLoading = false;
  
  // Propiedades para manejo de archivos
  fotoPreview: string | ArrayBuffer | null = null;
  fotoValida = false;
  fotoError = '';
  
  // Expresiones regulares para validación
  private readonly regex = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/,
    apellidos: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,80}$/,
    telefono: /^[\+]?[0-9\s\-\(\)]{8,20}$/,
    nacionalidad: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/,
    documento: /^[A-Za-z0-9\-]{5,20}$/,
    usuario: /^[A-Za-z0-9_]{4,20}$/,
    contrasena: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

  // Tipos de archivo permitidos
  private readonly tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly tamanoMaximo = 2 * 1024 * 1024; // 2MB

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  // Inicializar el formulario reactivo
  private inicializarFormulario(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.pattern(this.regex.nombre)
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.pattern(this.regex.apellidos)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(this.regex.telefono)
      ]],
      nacionalidad: ['', [
        Validators.required,
        Validators.pattern(this.regex.nacionalidad)
      ]],
      documento: ['', [
        Validators.required,
        Validators.pattern(this.regex.documento)
      ]],
      usuario: ['', [
        Validators.required,
        Validators.pattern(this.regex.usuario)
      ]],
      contrasena: ['', [
        Validators.required,
        Validators.pattern(this.regex.contrasena)
      ]],
      foto: [null]
    });

    // Escuchar cambios para validación en tiempo real
    this.registroForm.valueChanges.subscribe(() => {
      this.submitted = false;
    });
  }

  // Getter para acceder fácilmente a los controles
  get f(): { [key: string]: AbstractControl } {
    return this.registroForm.controls;
  }

  // Métodos de validación visual
  campoValido(campo: string): boolean {
    const control = this.f[campo];
    return control.valid && (control.touched || this.submitted);
  }

  campoInvalido(campo: string): boolean {
    const control = this.f[campo];
    return control.invalid && (control.touched || this.submitted);
  }

  mostrarError(campo: string): boolean {
    const control = this.f[campo];
    return control.invalid && (control.touched || this.submitted);
  }

  // Manejo de selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.validarYProcesarArchivo(archivo);
    }
  }

  private validarYProcesarArchivo(archivo: File): void {
    // Limpiar errores previos
    this.fotoError = '';
    
    // Validar tipo de archivo
    if (!this.tiposPermitidos.includes(archivo.type)) {
      this.fotoError = 'Formato de archivo no válido. Solo se aceptan JPG, PNG o GIF.';
      return;
    }

    // Validar tamaño
    if (archivo.size > this.tamanoMaximo) {
      this.fotoError = 'El archivo es demasiado grande. El tamaño máximo permitido es 2MB.';
      return;
    }

    // Procesar archivo válido
    this.registroForm.patchValue({ foto: archivo });
    this.registroForm.get('foto')?.updateValueAndValidity();
    this.fotoValida = true;

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result;
    };
    reader.onerror = () => {
      this.fotoError = 'Error al leer el archivo. Intente nuevamente.';
      this.fotoPreview = null;
      this.fotoValida = false;
    };
    reader.readAsDataURL(archivo);
  }

  // Método para activar el input file
  seleccionarArchivo(): void {
    const input = document.getElementById('foto') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  // Remover foto seleccionada
  removerFoto(): void {
    this.fotoPreview = null;
    this.fotoValida = false;
    this.registroForm.patchValue({ foto: null });
    const input = document.getElementById('foto') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // Envío del formulario
  onSubmit(): void {
    this.submitted = true;
    
    // Marcar todos los controles como touched para mostrar errores
    Object.keys(this.f).forEach(key => {
      const control = this.f[key];
      control.markAsTouched();
    });

    // Verificar si el formulario es válido
    if (this.registroForm.invalid) {
      this.scrollToFirstInvalid();
      return;
    }

    // Preparar datos para envío
    this.isLoading = true;
    
    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', this.registroForm.value.nombre);
    formData.append('apellidos', this.registroForm.value.apellidos);
    formData.append('telefono', this.registroForm.value.telefono);
    formData.append('nacionalidad', this.registroForm.value.nacionalidad);
    formData.append('documento', this.registroForm.value.documento);
    formData.append('usuario', this.registroForm.value.usuario);
    formData.append('contrasena', this.registroForm.value.contrasena);
    
    if (this.registroForm.value.foto) {
      formData.append('foto', this.registroForm.value.foto);
    }

    // Simular envío al servidor
    setTimeout(() => {
      this.procesarEnvioExitoso(formData);
    }, 2000);
  }

  private procesarEnvioExitoso(formData: FormData): void {
    this.isLoading = false;
    
    // Mostrar éxito
    console.log('Datos enviados:', {
      nombre: formData.get('nombre'),
      apellidos: formData.get('apellidos'),
      telefono: formData.get('telefono'),
      nacionalidad: formData.get('nacionalidad'),
      documento: formData.get('documento'),
      usuario: formData.get('usuario'),
      contrasena: '[PROTEGIDO]',
      foto: formData.get('foto') ? 'Adjuntada' : 'No adjuntada'
    });

    alert('¡Registro exitoso!\n\nSus datos han sido guardados correctamente.');
    
    // Cerrar modal después de éxito
    setTimeout(() => {
      this.cerrar.emit();
    }, 1500);
  }

  // Scroll al primer campo con error
  private scrollToFirstInvalid(): void {
    const firstInvalid = document.querySelector('.is-invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstInvalid as HTMLElement).focus();
    }
  }

  // Limpiar formulario
  limpiarFormulario(): void {
    this.registroForm.reset();
    this.submitted = false;
    this.fotoPreview = null;
    this.fotoValida = false;
    this.fotoError = '';
    
    // Resetear estado de validación
    Object.keys(this.f).forEach(key => {
      const control = this.f[key];
      control.markAsUntouched();
      control.markAsPristine();
      control.setErrors(null);
    });
  }
  
  onCerrar(): void {
    this.cerrar.emit();
  }
  
  onIrALogin(): void {
    this.cambiarALogin.emit();
  }
}