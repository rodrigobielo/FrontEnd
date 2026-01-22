// src/app/componentes/dashboard/dashboard.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit {
  // Datos para las tarjetas de resumen
  summaryCards = [
    { 
      title: 'Regiones', 
      count: 24, 
      change: 12, 
      icon: 'globe-americas', 
      color: 'primary'
    },
    { 
      title: 'Provincias', 
      count: 196, 
      change: 8, 
      icon: 'map', 
      color: 'success'
    },
    { 
      title: 'Ciudades', 
      count: 842, 
      change: 5, 
      icon: 'building', 
      color: 'info'
    },
    { 
      title: 'Hoteles', 
      count: 1254, 
      change: -3, 
      icon: 'house-door', 
      color: 'warning'
    },
    { 
      title: 'Categorías', 
      count: 8, 
      change: 15, 
      icon: 'tags', 
      color: 'danger'
    }
  ];

  currentUser: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.verificarAutenticacion();
  }

  private verificarAutenticacion(): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      console.warn('Usuario no autenticado. Redirigiendo al dashboard con datos de demostración...');
      
      // Para desarrollo/demostración, crear un usuario demo automáticamente
      this.crearUsuarioDemo();
      return;
    }
    
    // Obtener información del usuario actual
    const userData = localStorage.getItem('currentUser');
    this.currentUser = userData ? JSON.parse(userData) : { name: 'Administrador' };
  }

  private crearUsuarioDemo(): void {
    // Crear un usuario de demostración automáticamente
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ 
      name: 'Administrador Demo',
      email: 'admin@demo.com'
    }));
    
    this.currentUser = { name: 'Administrador Demo' };
    
    console.log('Usuario demo creado automáticamente para desarrollo');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showWelcomeModal();
    }, 1000);
  }

  private showWelcomeModal(): void {
    const modalAlreadyShown = sessionStorage.getItem('welcomeModalShown');
    
    if (modalAlreadyShown === 'true') {
      return;
    }
    
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      
      sessionStorage.setItem('welcomeModalShown', 'true');
      modal.show();
    }
  }

  onAddClick(cardType: string): void {
    console.log(`Añadir nuevo ${cardType}`);
    
    // Verificar autenticación antes de redirigir
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      this.crearUsuarioDemo(); // Crear usuario demo si no existe
    }
    
    switch(cardType.toLowerCase()) {
      case 'regiones':
        this.router.navigate(['/regiones'], { queryParams: { modo: 'nuevo' } });
        break;
      case 'provincias':
        this.router.navigate(['/provincias'], { queryParams: { modo: 'nuevo' } });
        break;
      case 'ciudades':
        this.router.navigate(['/ciudades'], { queryParams: { modo: 'nuevo' } });
        break;
      case 'hoteles':
        this.router.navigate(['/hoteles'], { queryParams: { modo: 'nuevo' } });
        break;
      case 'categorías':
        this.router.navigate(['/categorias'], { queryParams: { modo: 'nuevo' } });
        break;
    }
  }

  onListClick(cardType: string): void {
    console.log(`Ver lista de ${cardType}`);
    
    // Verificar autenticación antes de redirigir
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      this.crearUsuarioDemo(); // Crear usuario demo si no existe
    }
    
    switch(cardType.toLowerCase()) {
      case 'regiones':
        this.router.navigate(['/regiones']);
        break;
      case 'provincias':
        this.router.navigate(['/provincias']);
        break;
      case 'ciudades':
        this.router.navigate(['/ciudades']);
        break;
      case 'hoteles':
        this.router.navigate(['/hoteles']);
        break;
      case 'categorías':
        this.router.navigate(['/categorias']);
        break;
    }
  }

  getChangeBadgeClass(change: number): string {
    return change >= 0 ? 'bg-success' : 'bg-danger';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'arrow-up' : 'arrow-down';
  }

  cerrarSesion(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('welcomeModalShown');
      
      // Redirigir al dashboard (se creará usuario demo automáticamente)
      this.router.navigate(['/dashboard']).then(() => {
        window.location.reload(); // Recargar para limpiar estado
      });
    }
  }
}