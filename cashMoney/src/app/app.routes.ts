import { Routes } from '@angular/router';
import { Csocio } from '../componentes/csocio/csocio';
import { Ccajacentral } from '../componentes/ccajacentral/ccajacentral';


export const routes: Routes =
 [
  {path:"envios", component:Csocio},
  {path:"cajacentral", component:Ccajacentral}
 ];
