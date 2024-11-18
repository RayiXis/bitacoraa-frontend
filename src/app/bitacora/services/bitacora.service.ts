import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  mergeMap,
  of,
  tap,
  throwError,
} from 'rxjs';
import * as XLSX from 'xlsx';
import {
  UserEmployee,
  Services,
  UserTechnical,
  PaginationResponse,
  Tickets,
  User,
} from '../interfaces/Bitacora';
import { environment } from 'src/environments/environment';
import { Equipos } from '../interfaces/Equipos';
import { Accesorio, Agenda } from '../interfaces/Accesories';
import { Altas, Pdfs } from '../interfaces/pdfs.';

@Injectable({
  providedIn: 'root',
})
export class BitacoraService {
  private bitacoraApi = environment.apiUrl;
  private userRoleSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  constructor(private http: HttpClient) {}

  requestEquipment(request: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/accessory/request`,
      request
    );
  }

  // ************ ======================== SERVICIOS PARA LAS DEPENDENCIAS Y DIRECCIONES ========================************
  getAdmministrativeUnitByCode(code: string): Observable<any> {
    return this.http.get<any>(
      `${this.bitacoraApi}/administrative-unit/${code}`
    );
  }

  // ************ ======================== SERVICIOS PARA LOS USUARIOS ========================************
  getUsers(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/users?limit=${limit}&page=${page}`
    );
  }

  getDirectors(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/users/directors?limit=${limit}&page=${page}`
    );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.bitacoraApi}/users/profile`);
  }

  getProfileById(id: string): Observable<any> {
    return this.http.get<any>(`${this.bitacoraApi}/users/get-user/${id}`);
  }
  getUserDataById(userId: string): Observable<UserEmployee | null> {
    return this.http
      .get<any>(`${this.bitacoraApi}/users/get-user/${userId}`)
      .pipe(
        tap((response) => {
          // console.log('Respuesta del servicio getUserDataById:', response);
        }),
        map((response) => {
          // Verifica si `_doc` está presente y lo utiliza
          if (response && response._doc) {
            return {
              ...response._doc,
              name: response.name || response._doc.name,
              lastname: response.lastname || response._doc.lastname,
            };
          }
          return response;
        }),
        catchError(
          this.handleError<UserEmployee | null>('getUserDataById', null)
        )
      );
  }

  // Implementación correcta de handleError
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`); // Log del error en la consola
      return of(result as T); // Devuelve un resultado seguro
    };
  }

  getEmployeeById(id: string): Observable<UserEmployee> {
    return this.http.get<UserEmployee>(
      `${this.bitacoraApi}/users/get-user/${id}`
    );
  }
  getUsersByAdministrativeUnitCode(directorCode: string): Observable<any> {
    return this.http.get(
      `${this.bitacoraApi}/users/users-by-administrativeUnit-code/${directorCode}`
    );
  }

  getTechnicalById(id: string): Observable<UserTechnical> {
    return this.http.get<UserTechnical>(
      `${this.bitacoraApi}/users/get-user/${id}`
    );
  }

  getPeripheralId(id: string): Observable<any> {
    return this.http.get<any>(`${this.bitacoraApi}/peripheral-equipment/${id}`);
  }
  getCarsId(id: string): Observable<any> {
    return this.http.get<any>(`${this.bitacoraApi}/cars/${id}`);
  }
  getFurnitureId(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.bitacoraApi}/movable-property/get-movable-property/${id}`
    );
  }
  changeOwner(newOwner: string, deviceId: string): Observable<any> {
    const payload = { newOwner, deviceId };
    return this.http.patch<any>(
      `${this.bitacoraApi}/peripheral-equipment/change-owner/${newOwner}`,
      payload
    );
  }
  changeCarsOwner(userId: string, carId: string): Observable<any> {
    const payload = { userId, carId };
    return this.http.patch<any>(
      `${this.bitacoraApi}/cars/assign-car`,
      payload
    );
  }
  changeFurnitureOwner(userId: string, movableId: string): Observable<any> {
    const payload = { userId, movableId };
    return this.http.patch<any>(
      `${this.bitacoraApi}/movable-property/assign-movable`,
      payload
    );
  }

  // USUARIO LOGEADO
  currentEmployee(): Observable<UserEmployee> {
    return this.http.get<UserEmployee>(`${this.bitacoraApi}/users/profile`);
  }

  currentTechnical(): Observable<UserTechnical> {
    return this.http.get<UserTechnical>(`${this.bitacoraApi}/users/profile`);
  }

  getServices(): Observable<Services[]> {
    return this.http.get<Services[]>(`${this.bitacoraApi}/services`);
  }

  setUserRole(role: string): void {
    this.userRoleSubject.next(role);
  }

  getUserRole(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  hasRole(userRole: string | null, ...roles: string[]): boolean {
    if (userRole) {
      return roles.includes(userRole);
    } else {
      return false;
    }
  }

  getAllTechnicals(): Observable<UserTechnical[]> {
    return this.http.get<UserTechnical[]>(`${this.bitacoraApi}/users/technical`);
  }

  // ************ ======================== SERVICIOS PARA LOS EQUIPOS/ACCESORIOS ========================************
  getAllEquips(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${this.bitacoraApi}/accessory/accessories?limit=${limit}&page=${page}`
    );
  }

  getEquipos(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.bitacoraApi}/equipment/employee/${id}`);
  }

  getEquipmentByCode(code: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.bitacoraApi}/equipment/equipments-by-administrativeUnit-code/${code}`
    );
  }

  getEquipmentById(_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.bitacoraApi}/equipment/${_id}`);
  }

  getPeripherals(id: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.bitacoraApi}/peripheral-equipment/employee/${id}`
    );
  }

  getAccesoryById(id: string): Observable<Accesorio> {
    return this.http.get<Accesorio>(`${this.bitacoraApi}/accessory/${id}`);
  }

  pickUpAccesory(id: string) {
    return this.http.delete<Accesorio>(
      `${this.bitacoraApi}/accessory/agenda/${id}`
    );
  }

  getAgenda(
    page?: number,
    limit?: number,
    dateStartFilter?: string,
    dateEndFilter?: string,
    available?: boolean
  ): Observable<PaginationResponse> {
    let params = `page=${page}&limit=${limit}`;

    if (available) {
      params += `&available=${available}`;
    }

    if (dateStartFilter && dateEndFilter) {
      params += `&dateStartFilter=${dateStartFilter}&dateEndFilter=${dateEndFilter}`;
    }

    return this.http.get<PaginationResponse>(
      `${this.bitacoraApi}/accessory/agenda?${params}`
    );
  }

  getAgendaByUser(
    id: string,
    page?: number,
    limit?: number,
    dateStartFilter?: string,
    dateEndFilter?: string,
    available?: boolean
  ): Observable<PaginationResponse> {
    let params = `page=${page}&limit=${limit}`;

    if (dateStartFilter && dateEndFilter) {
      params += `&dateStartFilter=${dateStartFilter}&dateEndFilter=${dateEndFilter}`;
    }

    if (available) {
      params += `&available=${available}`;
    }

    return this.http.get<PaginationResponse>(
      `${this.bitacoraApi}/accessory/request-employee/${id}?${params}`
    );
  }

  getPdfs(term: string, page?: number, limit?: number): Observable<Pdfs> {
    let params = new HttpParams()
      .set('term', term)
      .set('page', page || 1)
      .set('limit', limit || 10);

    return this.http.get<Pdfs>(`${this.bitacoraApi}/ABT/pdfs`, { params });
  }

  getPdfsByUser(id: string, term: string): Observable<Altas[]> {
    const params = new HttpParams().set('userId', id).set('term', term);

    return this.http.get<Altas[]>(`${this.bitacoraApi}/ABT/pdfs-user`, {
      params,
    });
  }

  updateRequest(id: string, payload: any): Observable<any> {
    return this.http.put<any>(
      `${this.bitacoraApi}/accessory/request/${id}`,
      payload
    );
  }

  // ************ ======================== SERVICIOS PARA LOS TICKETS ========================************

  saveTicket(ticket: FormData): Observable<any> {
    return this.http.post(`${this.bitacoraApi}/tickets`, ticket);
  }

  getTickets(
    page?: number,
    limit?: number,
    dateStartFilter?: string,
    dateEndFilter?: string,
    status?: number
  ): Observable<PaginationResponse> {
    let params = `page=${page}&limit=${limit}`;

    if (dateStartFilter && dateEndFilter) {
      params += `&dateStartFilter=${dateStartFilter}&dateEndFilter=${dateEndFilter}`;
    }

    if (status !== undefined) {
      params += `&status=${status}`;
    }

    return this.http.get<PaginationResponse>(
      `${this.bitacoraApi}/tickets?${params}`
    );
  }

  getTicketById(id: string): Observable<Tickets> {
    return this.http.get<Tickets>(`${this.bitacoraApi}/tickets/${id}`);
  }

  autoAssignIssue(
    id: string,
    estimatedTime: string,
    reportType: string
  ): Observable<any> {
    const body = { estimatedTime, reportType };
    return this.http.patch<any>(
      `${this.bitacoraApi}/tickets/assign-estimated-time/${id}`,
      body
    );
  }

  assignedIssue(
    note: string,
    idTicket: string,
    idTech: string
  ): Observable<any> {
    // Llama al endpoint para asignar el ticket al técnico
    const assignTicket$ = this.http.patch<any>(
      `${this.bitacoraApi}/tickets/change-technical/${idTicket}/${idTech}`,
      ''
    );

    // Encadena la operación de añadir nota después de la asignación del ticket
    return assignTicket$.pipe(
      mergeMap(() => {
        // Llama al endpoint para añadir la nota al ticket asignado
        const payload = { note: note };
        return this.http.patch<any>(
          `${this.bitacoraApi}/tickets/add-note/${idTicket}`,
          payload
        );
      })
    );
  }

  addNote(note: string, id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.bitacoraApi}/tickets/add-note/${id}`,
      note
    );
  }

  finalizeManyTickets(ids: string[]): Observable<any> {
    return this.http.patch<any>(
      `${this.bitacoraApi}/tickets/finish-reports`,
      ids
    );
  }

  finalizeTicket(id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.bitacoraApi}/tickets/finish-report/${id}`,
      ''
    );
  }

  // ************ ======================== SERVICIOS PARA EXPORTAR TABLAS A EXCEL ========================************

  exportTableToExcel(tableId: string, fileName: string): void {
    let element = document.getElementById(tableId);
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // Eliminar la primera y última columna
    this.removeFirstAndLastColumn(ws);

    // Generar el libro y agregar la hoja de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Guardar el archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  private removeFirstAndLastColumn(ws: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
        if (C === range.s.c || C === range.e.c) {
          delete ws[cell_ref];
        }
      }
    }
    range.s.c++;
    range.e.c--;
    ws['!ref'] = XLSX.utils.encode_range(range.s, range.e);
  }
  // ************ ======================== SERVICIOS PARA ALTAS-BAJAS / TRAPASO-COMODATO ========================************//
  getEquipments(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${this.bitacoraApi}/equipment?limit=${limit}&page=${page}`
    );
  }
  getBorrowedEquipments(): Observable<any> {
    return this.http.get<any>(
      `${this.bitacoraApi}/equipment/borrowed-equipments`
    );
  }
}
