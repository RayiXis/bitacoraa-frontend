import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResetpassService {
  constructor(private http: HttpClient) {}

  checkEmailExistence(email: string) {
    return this.http.get(
      `${environment.apiUrl}/auth/forgot-password/check?email=${email}`
    );
  }

  sendResetPasswordRequest(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, {
      email,
    });
  }
}
