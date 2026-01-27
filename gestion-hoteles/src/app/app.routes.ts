import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// Función de guardia de ruta para autenticación
const authGuard = () => {
  const router = inject(Router);
  const usuario = localStorage.getItem('usuarioTurismo');
  
  if (usuario) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

// Función de redirección para usuarios autenticados
const redirectIfAuthenticated = () => {
  const router = inject(Router);
  const usuario = localStorage.getItem('usuarioTurismo');
  
  if (usuario) {
    router.navigate(['/inicio']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login').then(m => m.Login),
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro').then(m => m.RegistroComponent),
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: 'inicio',
    loadComponent: () => import('./componentes/inicio/inicio').then(m => m.Inicio),
    canActivate: [authGuard]
  },
  {
    path: 'hoteles',
    loadComponent: () => import('./componentes/hoteles/hoteles').then(m => m.Hoteles),
    canActivate: [authGuard]
  },
 
  {
    path: 'reservas',
    loadComponent: () => import('./componentes/reservas/reservas').then(m => m.ReservasComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];