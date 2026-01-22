import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Categoria, CategoriaDTO } from '../modelos/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8765/Categorias'; // URL del gateway
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las categorías
   * GET /Categorias/Listar
   */
  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/Listar`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una categoría por ID
   * GET /Categorias/{id}
   */
  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crea una nueva categoría
   * POST /Categorias/Crear
   */
  create(categoria: CategoriaDTO): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/Crear`, categoria, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una categoría existente
   * PUT /Categorias/{id}
   */
  update(id: number, categoria: CategoriaDTO): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una categoría
   * DELETE /Categorias/{id}
   */
  delete(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        map(() => true), // Si la operación es exitosa, retornamos true
        catchError(this.handleError)
      );
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 404:
          errorMessage = 'Categoría no encontrada.';
          break;
        case 409:
          errorMessage = 'Conflicto: La categoría ya existe o tiene datos relacionados.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intente más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en CategoriaService:', error);
    return throwError(() => new Error(errorMessage));
  }
}