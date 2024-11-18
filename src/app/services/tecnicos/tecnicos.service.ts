import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TecnicosService {
  constructor(private http: HttpClient) {}

  getServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/services`);
  }

  getTecnicosActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/technical`);
  }

  updateTecnico(userId: string, tecnico: any): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/users/update-technical/${userId}`,
      tecnico
    );
  }

  deleteTecnico(userId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/users/delete-user/${userId}`,
      {}
    );
  }

  registrarTecnico(tecnico: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/users/create-technical`,
      tecnico
    );
  }
}
