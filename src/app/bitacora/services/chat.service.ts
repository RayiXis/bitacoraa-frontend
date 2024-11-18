import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Tickets } from '../interfaces/Bitacora';
import { Observable } from 'rxjs';
import { Notes } from '../interfaces/Notes';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnInit {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    console.log(this.apiUrl);
  }

  getTicketByUser( id: string ): Observable<Tickets[]> {
    return this.http.get<Tickets[]>(`${this.apiUrl}/tickets/user/${id}`)
  }

  currentEmployee(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/profile`);
  }

  getTicketById( id: string ): Observable<Tickets> {
    return this.http.get<Tickets>(`${this.apiUrl}/tickets/${id}`)
  }

  sendMessage( id: string, message: string ): Observable<any> {
    const payload = { note: message }
    return this.http.patch<any>(`${this.apiUrl}/tickets/add-note/${id}`, payload)
  }

}
