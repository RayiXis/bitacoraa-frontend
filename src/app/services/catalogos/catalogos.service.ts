import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  PaginationResponse,
  UserEmployee,
} from 'src/app/bitacora/interfaces/Bitacora';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  constructor(private http: HttpClient) {}

  /*GET*/
  getUserById(userId: string): Observable<any> {
    return this.http
      .get<any>(`${environment.apiUrl}/users/get-user/${userId}`)
      .pipe(catchError(this.handleError));
  }
  getEmployeeById(id: string): Observable<UserEmployee> {
    return this.http.get<UserEmployee>(
      `${environment.apiUrl}/users/get-user/${id}`
    );
  }
  // USUARIO LOGEADO
  currentEmployee(): Observable<UserEmployee> {
    return this.http.get<UserEmployee>(`${environment.apiUrl}/users/profile`);
  }

  private handleError(error: any) {
    console.error('Error en la petición', error);
    return throwError(error);
  }
  getUsers(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/users?limit=${limit}&page=${page}`
    );
  }
  getEquipment(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/equipment?limit=${limit}&page=${page}`
    );
  }
  getPeripheral(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/peripheral-equipment?limit=${limit}&page=${page}`
    );
  }
  getAccesory(page?: number, limit?: number): Observable<PaginationResponse> {
    return this.http.get<any>(
      `${environment.apiUrl}/accessory/accessories?limit=${limit}&page=${page}`
    );
  }
  getPhone(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/phones`);
  }
  // ************ ======================== SERVICIOS PARA LAS DEPENDENCIAS Y DIRECCIONES ========================************
  getAdmministrativeUnitByCode(code: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiUrl}/administrative-unit/${code}`
    );
  }
  getDependenceByCode(code: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/dependence/code/${code}`);
  }
  /*POST*/
  darAltaEquipo(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/equipment`, formData);
  }
  darAltaPeriferico(formData: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/peripheral-equipment`,
      formData
    );
  }
  darAltaAccesorio(formData: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/accessory/create-accessory`,
      formData
    );
  }

  darAltaTelefono(
    ip: string,
    telephoneNumber: 0,
    userId: string,
    place: string
  ): Observable<any> {
    const phoneData = { ip, telephoneNumber, userId, place };
    return this.http.post(`${environment.apiUrl}/phones`, phoneData);
  }

  /*PUT y PATCH*/
  updateEquipment(_id: string, formData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/equipment/${_id}`, formData);
  }
  updatePeriferico(_id: string, formData: FormData): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/peripheral-equipment/${_id}`,
      formData
    );
  }
  updateAccesory(_id: string, accesoryData: any): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/accessory/${_id}`,
      accesoryData
    );
  }
  updatePhone(_id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/phones/${_id}`, formData);
  }
  /*DELETE*/
  deleteEquipment(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/equipment/${_id}`);
  }
  deleteAccesory(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/accessory/${_id}`);
  }
  deletePeripheral(_id: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/peripheral-equipment/${_id}`
    );
  }
  deletePhone(_id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/phones/${_id}`);
  }
  // ************ ======================== SERVICIOS PARA EXPORTAR TABLAS A EXCEL ========================************

  exportTableToExcel(
    tableId: string,
    fileName: string,
    userRole: string
  ): void {
    let element = document.getElementById(tableId);
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // Determinar si se deben eliminar la última columna o las últimas dos columnas
    if (userRole !== 'Technical' && userRole !== 'Receivership') {
      if (tableId === 'usuarios-table') {
        // Reemplaza 'tablaEspecial' con el ID de la tabla que solo necesita eliminar la última columna
        this.removeLastColumn(ws);
      } else {
        this.removeLastTwoColumns(ws);
      }
    }
    // Generar el libro y agregar la hoja de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Guardar el archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  //Método para eliminar solo la última columna de la hoja de trabajo
  private removeLastColumn(ws: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    if (range.e.c > range.s.c) {
      // Asegurarse de que hay más de una columna
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell_ref = XLSX.utils.encode_cell({ c: range.e.c, r: R });
        delete ws[cell_ref]; // Eliminar la celda de la última columna
      }
      range.e.c--; // Ajustar el rango de columnas para excluir la última columna
      ws['!ref'] = XLSX.utils.encode_range(range.s, range.e); // Actualizar el rango de la hoja
    }
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
}
