import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { BitacoraService } from '../../services/bitacora.service';
import { UserEmployee, UserTechnical } from '../../interfaces/Bitacora';
import { ModalEquipoComponent } from 'src/app/components';
import { Equipos } from '../../interfaces/Equipos';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss'],
})
export class UserPageComponent implements OnInit {
  equipment: any[] = [];
  public valorSeleccionado: boolean = false;
  public defaultValue: string = 'no';
  public datosEmpleado?: any;
  public equiposRegistrados?: any[];
  public equipoSeleccionado: any;
  public isModalOpen = false;
  public bitacoraApi: string = environment.apiUrl;

  constructor(
    private bitacoraServices: BitacoraService,
    private modalController: ModalController,
    private navController: NavController
  ) {}

  ngOnInit(): void {
    this.obtenerDataUser();
  }

  // ======================* MÉTODO PARA OBTENER LA DATA DEL USUARIO LOGEADO *======================*

  obtenerDataUser() {
    this.bitacoraServices.currentEmployee().subscribe((datosEmpleado) => {
      this.datosEmpleado = datosEmpleado;
      this.obtenerEquipos(datosEmpleado.authId);
      this.obtenerPerifericos(datosEmpleado.authId);
    });
  }

  // ======================* MÉTODOS PARA EL CAMBIO DE CONTRASEÑA *======================*

  changedPassword() {
    const webUrl = 'https://qa.oauth.navojoa.gob.mx/restore-password';
    window.open(webUrl, '_system');
  }

  // ======================* MÉTODOS PARA LOS EQUIPOS *======================*

  obtenerEquipos(id: string) {
    this.bitacoraServices.getEquipos(id).subscribe(
      (equipos) => {
        this.equiposRegistrados = equipos;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  obtenerPerifericos(userId: string) {
    this.bitacoraServices.getPeripherals(userId).subscribe((peripherals) => {
      this.equiposRegistrados = (this.equiposRegistrados || []).concat(
        peripherals
      );
    });
  }

  async openModalEquipo() {
    const modal = await this.modalController.create({
      component: ModalEquipoComponent,
      backdropDismiss: false,
    });
    await modal.present();
    await modal.onDidDismiss()

    this.obtenerPerifericos(this.datosEmpleado.authId);
    this.obtenerEquipos(this.datosEmpleado.authId);

  }

  darAltaEquipo(event: CustomEvent) {
    this.valorSeleccionado = event.detail.value === 'si';
  }

  showDetails(equipo: any) {
    this.isModalOpen = true;
    console.log(equipo);
    this.equipoSeleccionado = equipo;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
