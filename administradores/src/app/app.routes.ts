import { Routes } from '@angular/router';
import { Login } from '../componentes/login/login';
import { Dashboard } from '../componentes/dashboard/dashboard';
import { Regiones } from '../componentes/regiones/regiones';
import { Provincias } from '../componentes/provincias/provincias';
import { Ciudades } from '../componentes/ciudades/ciudades';
import { Hoteles } from '../componentes/hoteles/hoteles';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'regiones', component: Regiones },
  { path: 'provincias', component: Provincias },
  { path: 'ciudades', component: Ciudades },
  { path: 'hoteles', component: Hoteles },
  { path: '**', redirectTo: '/login' }
];