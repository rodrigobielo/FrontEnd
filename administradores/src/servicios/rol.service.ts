import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Roles } from '../modelos/roles.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private baseUrl = 'http://localhost:8765/Roles';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(`${this.baseUrl}/Listar`).pipe(
      map(roles => roles || []),
      catchError(this.handleError)
    );
  }

  getRolById(id: number): Observable<Roles> {
    return this.http.get<Roles>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createRol(rol: Roles): Observable<Roles> {
    return this.http.post<Roles>(`${this.baseUrl}/Crear`, rol, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateRol(id: number, rol: Roles): Observable<Roles> {
    return this.http.put<Roles>(`${this.baseUrl}/${id}`, rol, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  deleteRol(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en servicio Roles:', error);
    
    let errorMessage = 'Error en el servicio de roles';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}