import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from './componentes/navbar/navbar';
import { Hoteles } from './componentes/hoteles/hoteles';
import { Carrusel } from './componentes/carrusel/carrusel';
import { LugaresTuristicos } from './componentes/lugares-turisticos/lugares-turisticos';
import { Footer } from './componentes/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Navbar,
    Hoteles,
    Carrusel,
    LugaresTuristicos,
    Footer
  ],
  templateUrl: './app.html'
})
export class App {
  // Control de qué sección mostrar
  seccionActiva: 'inicio' | 'hoteles' | 'contactos' = 'inicio';
  
  // Métodos para cambiar sección
  mostrarInicio(): void {
    console.log('✅ APP: Mostrando sección Inicio');
    this.seccionActiva = 'inicio';
  }
  
  mostrarHoteles(): void {
    console.log('✅ APP: Mostrando sección Hoteles');
    this.seccionActiva = 'hoteles';
  }
  
  mostrarContactos(): void {
    console.log('✅ APP: Mostrando sección Contactos');
    this.seccionActiva = 'contactos';
  }
}