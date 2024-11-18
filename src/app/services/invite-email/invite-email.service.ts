import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InviteEmailService {
  constructor(private http: HttpClient) {}

  enviarCorreo(emails: string[]): Observable<any> {
    return this.http.post<string[]>(
      `${environment.apiUrl}/users/send-invitation`,
      emails
    );
  }
}
