import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Envio } from '../modelos/envio';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Senvio {
  private host:string="http://localhost:3333/envios/";
  private path!:string;

  constructor(private solicitudes:HttpClient){}

  listarEnvios():Observable<Envio[]> {
    this.path="listar";
     return this.solicitudes.get<Envio[]>(this.host+this.path);
  }

  guardarEnvio(envio:Envio):Observable<Envio>
  {
    this.path = "crear";
        return this.solicitudes.post<Envio>(this.host+this.path, envio);
  }
  

}
