import { Component, Signal } from '@angular/core';
import { Envio } from '../../modelos/envio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Senvio } from '../../servicios/senvio';




@Component({
  selector: 'app-csocio',
  imports: [CommonModule,FormsModule],
  templateUrl: './csocio.html',
  styleUrl: './csocio.css',
})
export class Csocio {

  tituloComponente!: string;
  operacion: number = 0;
  envio!: Envio;
  envios!:Envio[];
  funcionalidad:string="listar";


  constructor(private enviosS:Senvio) {
    this.tituloComponente = "MIS SOCIOS";
    this.envio =
    {
      codigo:" ",
      nombreEmisor: " ",
      telEmisor:"",
      ciudad:"",
      monto:0,
      fecha:new Date(),
      dip:"",
      apellidos:"",
      recepcion:{	
                  "id":2,
                  "codigo":" ",
                  "nombreReceptor":"",
                  "telReceptor":"",
                  "ciudad":"",
                  "monto":0,
                  "fechaEnvio": new Date(),
                  "dip":" ",
                  "apellidos":" "}
    }
    this.envio.ciudad="MONGOMO"
    this.recibir();
  
  }
  recibir() {
    this.enviosS.listarEnvios().subscribe(
      data=>
        {
          this.envios = data;
          console.log(this.envios);
        }
    )
    
  }
  enviar() {
      this.enviosS.guardarEnvio(this.envio).subscribe
      (
        data=>{console.log(data);}
      )
  }
 accion()
 {
  this.funcionalidad ="enviar";
 }
cancelar()
{this.funcionalidad="listar";}


}
