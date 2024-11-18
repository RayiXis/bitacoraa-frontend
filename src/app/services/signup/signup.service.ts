import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Dependencia, Direccion } from 'src/app/auth/interfaces/auth';
import { environment } from 'src/environments/environment';
import { CreateEmployee } from 'src/app/auth/interfaces/CreateEmployee';
import { PaginationResponse } from 'src/app/bitacora/interfaces/Bitacora';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  constructor(private http: HttpClient) {}

  registrarUsuario( dataEmployee: CreateEmployee ): Observable<CreateEmployee> {
    return this.http.post<CreateEmployee>(`${environment.apiUrl}/users/create-employee`, dataEmployee);
  }


  getDependencias(): Observable<PaginationResponse> {
    return this.http
      .get<PaginationResponse>(`${environment.apiUrl}/dependence?limit=1000`)
      .pipe(
        tap((data) => {
          // console.log('Dependencias obtenidas:', data);
        }),
        catchError((error) => {
          console.error('Error al obtener dependencias:', error);
          return throwError(error);
        })
      );
  }

  getDirecciones(dependencyCode: string): Observable<PaginationResponse> {
    return this.http
      .get<PaginationResponse>(
        `${environment.apiUrl}/administrative-unit?dependencyCode=${dependencyCode}`
      )
      .pipe(
        tap((data) => {
          // console.log('Direcciones obtenidas:', data); // Verificar los datos recibidos
        }),
        catchError((error) => {
          console.error('Error al obtener direcciones:', error);
          return throwError(error);
        })
      );
  }
}
