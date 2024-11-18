import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TecnicosServiciosdataService {
  servicios: string[] = [];
  tecnicos: any[] = [];

  constructor() {}
  agregarTecnico(tecnico: any) {
    this.tecnicos.push(tecnico);
  }
  obtenerTecnicos(): any[] {
    return this.tecnicos;
  }

  agregarServicio(servicio: string) {
    this.servicios.push(servicio);
  }

  obtenerServicio(): string[] {
    return this.servicios;
  }
}
