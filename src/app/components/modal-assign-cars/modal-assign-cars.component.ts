import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-assign-cars',
  templateUrl: './modal-assign-cars.component.html',
  styleUrls: ['./modal-assign-cars.component.scss'],
})
export class ModalAssignCarsComponent implements OnInit {
  @Input() vehiculo: any = null;
  public cars!: any;
  public apiUrl = environment.apiUrl;
  public users?: any[];
  public ownerDevice?: any;
  public filteredUsers?: any[];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  @Input() carsId: string = '';

  constructor(
    private bitacoraService: BitacoraService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.getCarsId();
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

  getCarsId() {
    this.bitacoraService.getCarsId(this.carsId).subscribe((vehiculo) => {
      this.cars = vehiculo;
      this.userDeviceOwner(vehiculo.userId);
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
      .changeCarsOwner(this.selectedUser.userId, idDevice)
      .subscribe(
        (res) => {
          this.alert(
            'Cambiar propietario del vehiculo',
            'El vehiculo se a cambiado correctamente de usuario.',
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
            `id del usuario:${this.selectedUser.userId} \nid del vehiculo: ${idDevice}`
          );
          console.log(err);
          this.alert(
            'A ocurrido un problema inesperado',
            'No hemos podido cambiar el vehiculo de usuario. Intentarlo más tarde',
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
      'Asignar vehiculo a un usuario',
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
