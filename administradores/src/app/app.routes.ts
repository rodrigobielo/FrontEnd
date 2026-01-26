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
  
  // Rutas para hoteles con ID específico (administrador del hotel)
  {
    path: 'hoteles/:hotelId',
    children: [
      // Habitaciones del hotel
      {
        path: 'habitaciones',
        loadComponent: () => import('../componentes/habitaciones/habitaciones').then(m => m.Habitaciones)
      },
      {
        path: 'habitaciones/nueva',
        loadComponent: () => import('../componentes/habitaciones/habitaciones').then(m => m.Habitaciones)
      },
      {
        path: 'habitaciones/:habitacionId',
        loadComponent: () => import('../componentes/habitaciones/habitaciones').then(m => m.Habitaciones)
      },
      {
        path: 'habitaciones/:habitacionId/editar',
        loadComponent: () => import('../componentes/habitaciones/habitaciones').then(m => m.Habitaciones)
      },
      
      // Tipos de habitación del hotel
      {
        path: 'tipos-habitaciones',
        loadComponent: () => import('../componentes/tipos-habitaciones/tipos-habitaciones').then(m => m.TiposHabitaciones)
      },
      {
        path: 'tipos-habitaciones/nuevo',
        loadComponent: () => import('../componentes/tipos-habitaciones/tipos-habitaciones').then(m => m.TiposHabitaciones)
      },
      {
        path: 'tipos-habitaciones/:tipoId',
        loadComponent: () => import('../componentes/tipos-habitaciones/tipos-habitaciones').then(m => m.TiposHabitaciones)
      },
      {
        path: 'tipos-habitaciones/:tipoId/editar',
        loadComponent: () => import('../componentes/tipos-habitaciones/tipos-habitaciones').then(m => m.TiposHabitaciones)
      },
      
      // Reservas del hotel
      {
        path: 'reservas',
        loadComponent: () => import('../componentes/reservas/reservas').then(m => m.ReservasComponent)
      },
      {
        path: 'reservas/nueva',
        loadComponent: () => import('../componentes/reservas/reservas').then(m => m.ReservasComponent)
      },
      {
        path: 'reservas/nueva-rapida',
        loadComponent: () => import('../componentes/reservas/reservas').then(m => m.ReservasComponent)
      },
      {
        path: 'reservas/:reservaId',
        loadComponent: () => import('../componentes/reservas/reservas').then(m => m.ReservasComponent)
      },
      {
        path: 'reservas/:reservaId/editar',
        loadComponent: () => import('../componentes/reservas/reservas').then(m => m.ReservasComponent)
      },
      
      // Pagos del hotel
      {
        path: 'pagos',
        loadComponent: () => import('../componentes/pagos/pagos').then(m => m.Pagos)
      },
      {
        path: 'pagos/registrar',
        loadComponent: () => import('../componentes/pagos/pagos').then(m => m.Pagos)
      },
      {
        path: 'pagos/:pagoId',
        loadComponent: () => import('../componentes/pagos/pagos').then(m => m.Pagos)
      },
      {
        path: 'pagos/:pagoId/editar',
        loadComponent: () => import('../componentes/pagos/pagos').then(m => m.Pagos)
      },
      
      // Fotos del hotel
      {
        path: 'fotos',
        loadComponent: () => import('../componentes/fotos/fotos').then(m => m.Fotos)
      },
      {
        path: 'fotos/subir',
        loadComponent: () => import('../componentes/fotos/fotos').then(m => m.Fotos)
      },
      {
        path: 'fotos/:galeriaId',
        loadComponent: () => import('../componentes/fotos/fotos').then(m => m.Fotos)
      }
    ]
  },
  
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];