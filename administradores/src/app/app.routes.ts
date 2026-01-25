import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('../componentes/login/login').then(m => m.Login)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('../componentes/dashboard/dashboard').then(m => m.Dashboard)
  },
  { 
    path: 'dashboard-hotel', 
    loadComponent: () => import('../componentes/dashboard-hotel/dashboard-hotel').then(m => m.DashboardHotel)
  },
  // Regiones
  { 
    path: 'regiones', 
    loadComponent: () => import('../componentes/regiones/regiones').then(m => m.Regiones)
  },
 
  // Provincias
  { 
    path: 'provincias', 
    loadComponent: () => import('../componentes/provincias/provincias').then(m => m.Provincias)
  },
  
  // Ciudades
  { 
    path: 'ciudades', 
    loadComponent: () => import('../componentes/ciudades/ciudades').then(m => m.Ciudades)
  },
 
  // Hoteles
  { 
    path: 'hoteles', 
    loadComponent: () => import('../componentes/hoteles/hoteles').then(m => m.Hoteles)
  },
 
  // Categorías
  { 
    path: 'categorias', 
    loadComponent: () => import('../componentes/categorias/categorias').then(m => m.Categorias)
  },
 
  // Usuarios
  { 
    path: 'usuarios', 
    loadComponent: () => import('../componentes/usuarios/usuarios').then(m => m.Usuarios)
  },
  /*{ 
    path: 'usuarios/nuevo', 
    loadComponent: () => import('../componentes/usuarios/nuevo-usuario/nuevo-usuario').then(m => m.NuevoUsuario)
  },
   { 
    path: 'perfil', 
    loadComponent: () => import('../componentes/perfil/perfil.component')
      .then(m => m.PerfilComponent)
  },*/
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];