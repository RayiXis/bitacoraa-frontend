import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  AltasBajasComponent,
  ComodatoTraspasoComponent,
  ModalLevantarTicketComponent,
  ModalSolicitarEquipoComponent,
} from 'src/app/components';
import { BitacoraService } from '../../services/bitacora.service';
import { ActualizarComponent } from 'src/app/components/actualizar/actualizar.component';
import { Equipos } from '../../interfaces/Equipos';
import { environment } from 'src/environments/environment';
import { User, UserEmployee, UserTechnical } from '../../interfaces/Bitacora';
import { jwtDecode } from 'jwt-decode';
import { ReturnComodatoComponent } from 'src/app/components/return-comodato/return-comodato.component';

@Component({
  selector: 'app-inicio-page',
  templateUrl: './inicio-page.component.html',
  styleUrls: ['./inicio-page.component.scss'],
})
export class InicioPageComponent {
  public abt: string = '';
  public job: any;
  public user!: User;
  public datosUsuario: UserEmployee | UserTechnical | null = null;
  public equipos?: Equipos[];
  public selectedEquipo?: Equipos;
  public userRole: string | null = null;
  public url: string = environment.apiUrl;
  public canSeeRegresarComodatoButton: boolean = false;

  constructor(
    private router: Router,
    private modalController: ModalController,
    private bitacoraService: BitacoraService
  ) {}

  ngOnInit() {
    this.getUserProfile();
    this.bitacoraService.currentEmployee().subscribe((datauser) => {
      this.datosUsuario = datauser;
      this.extractUserRole();
    });
  }

  get userName(): string {
    return this.user ? `${this.user.name} ${this.user.lastname}` : 'Mis Datos';
  }

  getUserProfile() {
    this.bitacoraService.getUserProfile().subscribe((user) => {
      this.job = user.job;
      this.abt = user.abt;
      this.user = user;
      console.log(user);
      this.getDevices(this.user.authId);
      // Actualiza el valor de canSeeRegresarComodatoButton basado en las condiciones
      this.updateRegresarComodatoButtonVisibility();
    });
  }

  updateRegresarComodatoButtonVisibility() {
    this.canSeeRegresarComodatoButton =
      this.abt === 'T' ||
      this.abt === 'P' ||
      this.job === 'Director' ||
      this.hasRole('Admin');
  }

  getDevices(id: string) {
    this.bitacoraService.getEquipos(id).subscribe((equipos) => {
      this.equipos = equipos;
      this.selectedEquipo = this.equipos?.[0];
    });
  }

  selectEquipo(equipo: Equipos) {
    this.selectedEquipo = equipo;
  }

  async levantarTicketModal() {
    const modal = await this.modalController.create({
      component: ModalLevantarTicketComponent,
    });
    return await modal.present();
  }

  async solicitarEquipo() {
    const modal = await this.modalController.create({
      component: ModalSolicitarEquipoComponent,
    });
    return await modal.present();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['auth/']);
  }
  userPage() {
    this.router.navigate(['bitacora/usuario']);
  }

  async openComodatoTrapaso(type: string) {
    const modal = await this.modalController.create({
      component: ComodatoTraspasoComponent,
      componentProps: { modalType: type },
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async openRegresarComodato() {
    const modal = await this.modalController.create({
      component: ReturnComodatoComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  openComodato() {
    this.openComodatoTrapaso('comodato');
  }

  openTraspaso() {
    this.openComodatoTrapaso('traspaso');
  }

  async openAltasBajas(type: string) {
    const modal = await this.modalController.create({
      component: AltasBajasComponent,
      componentProps: { modalType: type },
      backdropDismiss: false,
    });
    return await modal.present();
  }

  openAlta() {
    this.openAltasBajas('alta');
  }
  openBaja() {
    this.openAltasBajas('baja');
  }

  async openActualizacion() {
    const modal = await this.modalController.create({
      component: ActualizarComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  openABTActualizacion() {
    this.openActualizacion();
  }

  extractUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userRole = decodedToken.Role;
      } catch (error) {
        console.error('Error decodificando el token', error);
      }
    } else {
      console.warn('No se encontró el token');
    }
  }

  hasRole(...roles: string[]): boolean {
    if (this.userRole) {
      return roles.includes(this.userRole);
    } else {
      return false;
    }
  }
}
