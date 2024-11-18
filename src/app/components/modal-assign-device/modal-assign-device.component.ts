import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { Equipos } from 'src/app/bitacora/interfaces/Equipos';
import { DevicesService } from 'src/app/bitacora/services/devices.service';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';

@Component({
  selector: 'app-modal-assign-device',
  templateUrl: './modal-assign-device.component.html',
  styleUrls: ['./modal-assign-device.component.scss'],
})
export class ModalAssignDeviceComponent implements OnInit {
  public equipo!: Equipos;
  public apiUrl = environment.apiUrl;
  public users?: any[];
  public ownerDevice?: any;
  public filteredUsers?: any[];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  @Input() deviceId: string = '';

  constructor(
    private bitacoraService: BitacoraService,
    private deviceService: DevicesService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.getDeviceId();
    this.loadUser();
  }

  loadUser() {
    this.deviceService.getUsers(1, 1000).subscribe((users) => {
      this.users = users.data.filter(
        (users) => users.status === 0 || users.status === 1
      );
      this.filteredUsers = users.data;
    });
  }

  getDeviceId() {
    this.deviceService.getDeviceId(this.deviceId).subscribe((equipo) => {
      this.equipo = equipo;
      this.userDeviceOwner(equipo.userId);
    });
  }

  userDeviceOwner(id: string) {
    this.bitacoraService.getProfileById(id).subscribe((user) => {
      this.ownerDevice = user;
    });
  }

  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  selectUser(usuario: any) {
    this.selectedUser = usuario;
    this.isUserSelected = true;
    this.modalController.dismiss();
  }

  changeOwner(idDevice: string) {
    this.deviceService
      .changeOwner(this.selectedUser.userId, idDevice)
      .subscribe(
        (res) => {
          this.alert(
            'Cambiar propietario del equipo',
            'El equipo se a cambiado correctamente de usuario.',
            [
              {
                text: 'Aceptar',
                role: 'confirm',
                handler: () => {
                  this.modalController.dismiss();
                  window.location.reload(); // Recargar la página
                },
              },
            ]
          );
        },
        (err) => {
          console.log(
            `id del usuario:${this.selectedUser.userId} \nid del equipo: ${idDevice}`
          );
          console.log(err);
          this.alert(
            'A ocurrido un problema inesperado',
            'No hemos podido cambiar el equipo de usuario. Intentarlo más tarde',
            [
              {
                text: 'Aceptar',
                role: 'confirm',
                handler: () => {
                  this.modalController.dismiss();
                },
              },
            ]
          );
        }
      );
  }

  closeModal() {
    this.alert('Asignar equipo a un usuario', '¿Desea cancelar este proceso?', [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        role: 'confirm',
        handler: () => {
          this.modalController.dismiss();
        },
      },
    ]);
  }

  async alert(header: string, message: string, btns: any[] = ['Ok']) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: btns,
    });
    await alert.present();
  }
}
