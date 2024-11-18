import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-assign-peripheral',
  templateUrl: './modal-assign-peripheral.component.html',
  styleUrls: ['./modal-assign-peripheral.component.scss'],
})
export class ModalAssignPeripheralComponent implements OnInit {
  @Input() periferico: any = null;
  public peripheral!: any;
  public apiUrl = environment.apiUrl;
  public users?: any[];
  public ownerDevice?: any;
  public filteredUsers?: any[];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  @Input() peripheralId: string = '';

  constructor(
    private bitacoraService: BitacoraService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.getPeripheralId();
    this.loadUser();
  }

  loadUser() {
    this.bitacoraService.getUsers(1, 1000).subscribe((users) => {
      this.users = users.data.filter(
        (user) => user.status === 0 || user.status === 1
      );
      this.filteredUsers = users.data;
    });
  }

  getPeripheralId() {
    this.bitacoraService
      .getPeripheralId(this.peripheralId)
      .subscribe((periferico) => {
        this.peripheral = periferico;
        this.userDeviceOwner(periferico.userId);
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
    this.bitacoraService
      .changeOwner(this.selectedUser.userId, idDevice)
      .subscribe(
        (res) => {
          this.alert(
            'Cambiar propietario del periferico',
            'El periferico se a cambiado correctamente de usuario.',
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
            `id del usuario:${this.selectedUser.userId} \nid del periferico: ${idDevice}`
          );
          console.log(err);
          this.alert(
            'A ocurrido un problema inesperado',
            'No hemos podido cambiar el periferico de usuario. Intentarlo más tarde',
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
    this.alert(
      'Asignar periferico a un usuario',
      '¿Desea cancelar este proceso?',
      [
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
      ]
    );
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
