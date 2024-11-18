import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  iniciarSesion(Email: string, Password: string): Observable<any> {
    const url = environment.apiUrl;
    const loginData = { Email, Password };

    return this.http.post(`${url}/auth`, loginData);
  }
}
