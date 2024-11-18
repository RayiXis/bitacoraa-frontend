import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServiciosPageService {
  constructor(private http: HttpClient) {}

  registrarServicio(serviciosData: {
    name: string;
    description: string;
    estimatedTime: number;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/services`, serviciosData);
  }
}
