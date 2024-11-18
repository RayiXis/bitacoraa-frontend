import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Equipos } from '../interfaces/Equipos';
import { PaginationResponse } from '../interfaces/Bitacora';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDeviceId( id: string ): Observable<Equipos> {
    return this.http.get<Equipos>(`${this.apiUrl}/equipment/${id}`);
  }

  getUsers(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${this.apiUrl}/users?limit=${limit}&page=${page}`
    );
  }

  changeOwner( newOwner: string, deviceId: string ): Observable<any> {
    const payload = { newOwner, deviceId }
    return this.http.patch<any>(`${this.apiUrl}/equipment/change-owner`, payload);
  }

}
