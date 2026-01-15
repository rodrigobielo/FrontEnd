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
    }
  ];

  currentUser: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/login']);
      return;
    }
    
    // Obtener información del usuario actual
    const userData = localStorage.getItem('currentUser');
    this.currentUser = userData ? JSON.parse(userData) : { name: 'Administrador' };
  }

  ngAfterViewInit(): void {
    // Mostrar modal de bienvenida después de 1 segundo, solo si no se ha mostrado antes
    setTimeout(() => {
      this.showWelcomeModal();
    }, 1000);
  }

  // Método para mostrar el modal de bienvenida - MODIFICADO
  private showWelcomeModal(): void {
    // Verificar si ya se ha mostrado el modal en esta sesión
    const modalAlreadyShown = sessionStorage.getItem('welcomeModalShown');
    
    if (modalAlreadyShown === 'true') {
      return; // Ya se mostró, no volver a mostrar
    }
    
    const modalElement = document.getElementById('welcomeModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      
      // Marcar que el modal se ha mostrado
      sessionStorage.setItem('welcomeModalShown', 'true');
      
      modal.show();
      
      // Limpiar la marca cuando se cierre el modal (opcional)
      modalElement.addEventListener('hidden.bs.modal', () => {
        // Puedes mantener la marca si quieres que solo aparezca una vez por sesión
        // Si quieres que aparezca cada vez que entras al dashboard, comenta la línea de sessionStorage
      });
    }
  }

  // Métodos para los botones - CORREGIDOS para redirigir correctamente
  onAddClick(cardType: string): void {
    console.log(`Añadir nuevo ${cardType}`);
    
    // Redirigir a la página correspondiente para añadir
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
    }
  }

  onListClick(cardType: string): void {
    console.log(`Ver lista de ${cardType}`);
    
    // Redirigir a la página correspondiente para ver la lista
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
    }
  }

  // Método para determinar la clase de badge según el cambio
  getChangeBadgeClass(change: number): string {
    return change >= 0 ? 'bg-success' : 'bg-danger';
  }

  // Método para determinar el ícono de cambio
  getChangeIcon(change: number): string {
    return change >= 0 ? 'arrow-up' : 'arrow-down';
  }

  // Método para cerrar sesión - MEJORADO para limpiar sessionStorage
  cerrarSesion(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Mostrar confirmación
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Eliminar datos de sesión
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      
      // También limpiar sessionStorage para que el modal aparezca en el próximo login
      sessionStorage.removeItem('welcomeModalShown');
      
      // Redirigir al login
      this.router.navigate(['/login']);
    }
  }
}