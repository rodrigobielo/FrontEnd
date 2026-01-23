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
    path: 'regiones', 
    loadComponent: () => import('../componentes/regiones/regiones').then(m => m.Regiones)
  },
  { 
    path: 'provincias', 
    loadComponent: () => import('../componentes/provincias/provincias').then(m => m.Provincias)
  },
  { 
    path: 'ciudades', 
    loadComponent: () => import('../componentes/ciudades/ciudades').then(m => m.Ciudades)
  },
  { 
    path: 'hoteles', 
    loadComponent: () => import('../componentes/hoteles/hoteles').then(m => m.Hoteles)
  },
  { 
    path: 'categorias', 
    loadComponent: () => import('../componentes/categorias/categorias').then(m => m.Categorias)
  },
 /* { 
    path: 'perfil', 
    loadComponent: () => import('../componentes/perfil/perfil.component')
      .then(m => m.PerfilComponent)
  },*/
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];