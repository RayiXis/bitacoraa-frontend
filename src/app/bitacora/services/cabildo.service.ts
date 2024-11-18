import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CabildoService {

  private endpoint = 'cabildo';

  constructor(private http: HttpClient) { }

  getCabildo() {
    return this.http.get(`${environment.apiUrl}/${this.endpoint}/cabildos`);
  }
}
