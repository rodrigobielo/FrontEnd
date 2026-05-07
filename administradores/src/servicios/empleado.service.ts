import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Empleado, EmpleadoCreate, EmpleadoResponse } from '../modelos/empleado.model';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = 'http://localhost:3333/Empleados';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getEmpleados(): Observable<EmpleadoResponse[]> {
    console.log('Llamando a:', `${this.apiUrl}/Listar`);
    return this.http.get<EmpleadoResponse[]>(`${this.apiUrl}/Listar`).pipe(
      map(response => this.safeMapResponse(response)),
      catchError(error => {
        console.error('Error al cargar empleados', error);
        return of([]);
      })
    );
  }

  getEmpleadoById(id: number): Observable<EmpleadoResponse> {
    return this.http.get<EmpleadoResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error al cargar empleado', error);
        return throwError(() => error);
      })
    );
  }

  crearEmpleado(empleado: EmpleadoCreate): Observable<EmpleadoResponse> {
    console.log('Creando empleado:', empleado);
    return this.http.post<EmpleadoResponse>(`${this.apiUrl}/Crear`, empleado, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error al crear empleado', error);
        return throwError(() => error);
      })
    );
  }

  actualizarEmpleado(id: number, empleado: Partial<Empleado>): Observable<EmpleadoResponse> {
    console.log('Actualizando empleado:', id, empleado);
    return this.http.put<EmpleadoResponse>(`${this.apiUrl}/${id}`, empleado, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error al actualizar empleado', error);
        return throwError(() => error);
      })
    );
  }

  eliminarEmpleado(id: number): Observable<void> {
    console.log('Eliminando empleado:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      catchError(error => {
        console.error('Error al eliminar empleado', error);
        return throwError(() => error);
      })
    );
  }

  private safeMapResponse(response: any): EmpleadoResponse[] {
    if (response === null || response === undefined) {
      return [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (typeof response === 'object') {
      return [response];
    }
    return [];
  }
}