import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, mergeMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginationResponse } from 'src/app/bitacora/interfaces/Bitacora';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class SindicaturaService {
  constructor(private http: HttpClient) {}

  /*POST*/
  darAltaVehiculo(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/cars`, formData);
  }

  darAltaMueble(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/movable-property`, formData);
  }

  darAltaInmueble(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/properties`, formData);
  }

  darAltaDependencia(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/dependence/fetch`, data);
  }

  darAltaDireccion(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/administrative-unit/fetch`,
      data
    );
  }
  /*-------------------------------------------------------------------*/
  /*GET*/
  getUsers(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/users?limit=${limit}&page=${page}`
    );
  }
  getLoggedUser() {
    return this.http.get<any>(`${environment.apiUrl}/users/profile`);
  }
  getUserDataById(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/get-user/${userId}`);
  }
  getVehiculo(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/cars?limit=${limit}&page=${page}`
    );
  }
  getMuebles(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/movable-property?limit=${limit}&page=${page}`
    );
  }
  getInmobiliario(
    page?: number,
    limit?: number
  ): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/properties?limit=${limit}&page=${page}`
    );
  }
  getDependencias(
    page?: number,
    limit?: number
  ): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/dependence?limit=${limit}&page=${page}`
    );
  }
  getDirecciones(
    page?: number,
    limit?: number
  ): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/administrative-unit?limit=${limit}&page=${page}`
    );
  }
  /*DELETE*/
  deleteVehiculos(_id: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.delete(`${environment.apiUrl}/cars/${_id}`, {
      headers,
      responseType: 'text',
    });
  }

  deleteMuebles(_id: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/movable-property/delete-movable-property/${_id}`
    );
  }
  deleteInmuebles(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/properties/${_id}`);
  }

  deleteDependencia(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/dependence/${_id}`);
  }

  deleteDireccion(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/administrative-unit/${_id}`);
  }
  /*---------------------------------------------------------------------*/
  /*PATCH*/
  updateVehiculo(_id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/cars/${_id}`, formData);
  }

  updateMueble(_id: string, formData: FormData): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/movable-property/update-movable-property/${_id}`,
      formData
    );
  }

  updateInmueble(_id: string, formData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/properties/${_id}`, formData);
  }

  updateDependencia(_id: string, formData: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/dependence/${_id}`, formData);
  }
  updateDireccion(_id: string, formData: any): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/administrative-unit/${_id}`,
      formData
    );
  }
  // ************ ======================== SERVICIOS PARA EXPORTAR TABLAS A EXCEL ========================************

  exportTableToExcel(tableId: string, fileName: string): void {
    let element = document.getElementById(tableId);
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // Eliminar la penultima y última columna
    this.removeLastTwoColumns(ws);

    // Generar el libro y agregar la hoja de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Guardar el archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
  // Método para eliminar las últimas dos columnas de la hoja de trabajo
  private removeLastTwoColumns(ws: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    if (range.e.c > range.s.c + 1) {
      // Asegurarse de que hay más de dos columnas
      for (let R = range.s.r; R <= range.e.r; ++R) {
        // Eliminar las celdas de la penúltima columna
        const secondLastCellRef = XLSX.utils.encode_cell({
          c: range.e.c - 1,
          r: R,
        });
        delete ws[secondLastCellRef];
        // Eliminar las celdas de la última columna
        const lastCellRef = XLSX.utils.encode_cell({ c: range.e.c, r: R });
        delete ws[lastCellRef];
      }
      range.e.c -= 2; // Ajustar el rango de columnas para excluir las últimas dos columnas
      ws['!ref'] = XLSX.utils.encode_range(range.s, range.e); // Actualizar el rango de la hoja
    }
  }
  // ************ ======================== SERVICIOS PARA LAS DEPENDENCIAS Y DIRECCIONES ========================************
  getDependenceByCode(code: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/dependence/code/${code}`);
  }
  getAdmministrativeUnitByCode(code: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/administrative-unit/${code}`
    );
  }
}
