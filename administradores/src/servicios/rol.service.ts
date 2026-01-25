import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Rol, RolSimple } from '../modelos/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'http://localhost:8765/Roles'; // Ajusta la URL según tu backend

  constructor(private http: HttpClient) { }

  getAll(): Observable<RolSimple[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Listar`).pipe(
      map(roles => {
        console.log('Roles cargados:', roles);
        return roles.map(rol => ({
          id: rol.id || 0,
          nombre: rol.nombre || ''
        }));
      })
    );
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }
}