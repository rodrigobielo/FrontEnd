import { Component } from '@angular/core';

@Component({
  selector: 'app-ccajacentral',
  imports: [],
  templateUrl: './ccajacentral.html',
  styleUrl: './ccajacentral.css',
})
export class Ccajacentral {

  accion:string="";
  operacion()
  {
    this.accion="aperturar";
  }

}
