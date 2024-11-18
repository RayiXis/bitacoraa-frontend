import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import {
  Equipos,
  PaginationResponse,
} from 'src/app/bitacora/interfaces/Bitacora';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-altas-bajas',
  templateUrl: './altas-bajas.component.html',
  styleUrls: ['./altas-bajas.component.scss'],
})
export class AltasBajasComponent implements OnInit {
  altasbajasForm: FormGroup;
  @Input() modalType: 'alta' | 'baja' = 'alta';

  private api = environment.apiUrl;
  filteredEquipments: Equipos[] = [];
  filteredUsers: any[] = [];
  selectedEquipment: any;
  selectedUser: any;
  public equipments: any[] = [];
  public users: any[] = [];
  userCode: any;
  public isEquipmentSelected: boolean = false;
  public isUserSelected: boolean = false;
  public isConCopiaSelected: boolean = false;
  public progress: number = 0;
  public isProgressVisible = false;
  loggedUser: any;

  conCopiaUsers: any[] = [];
  filteredConCopiaUsers: any[] = [];
  selectedConCopiaUser: any;

  modalTitle: string = 'Alta';

  status: number = 0;

  public page: number = 1;
  public limit: number = 10;
  public lastPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private bitacoraService: BitacoraService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.altasbajasForm = this.formBuilder.group({
      equipmentId: [''],
      freeText: [''],
      ccp: [[]],
    });
  }

  async ngOnInit() {
    this.modalTitle =
      this.modalType === 'baja' ? 'Solicitud de Baja' : 'Solicitud de Alta';
    await this.getLoggedUser();
    this.loadEquipments(this.loggedUser.code);
    this.loadUser();
  }

  getLoggedUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/users/profile`).subscribe(
        (res: any) => {
          this.loggedUser = res;
          this.userCode = res.code;
          resolve();
        },
        (error) => {
          console.error('Error al obtener el usuario logueado', error);
          reject(error);
        }
      );
    });
  }
  loadEquipments(code: string) {
    this.bitacoraService.getEquipmentByCode(code).subscribe(
      (equipments) => {
        if (this.modalType === 'alta') {
          this.equipments = equipments.filter(
            (equipment) =>
              equipment.available === true && equipment.state === true
          );
        } else if (this.modalType === 'baja') {
          this.equipments = equipments.filter(
            (equipment) =>
              equipment.available === false && equipment.state === true
          );
        }
        // Asignar equipos filtrados a filteredEquipments
        this.filteredEquipments = this.equipments;
      },
      (error) => {
        console.error('Error al cargar los equipos', error);
      }
    );
  }
  loadUser() {
    this.bitacoraService.getUsers(1, 1000).subscribe((users) => {
      // Filtrar usuarios según el estado y excluir al usuario logueado
      this.users = users.data.filter(
        (user) =>
          (user.status === 0 || user.status === 1) &&
          user.userId !== this.loggedUser.authId // Asegúrate de excluir el usuario logueado
      );

      // Asignar la lista filtrada a filteredUsers
      this.filteredUsers = [...this.users];
    });
  }

  openEquipmentModal() {
    this.loadEquipments(this.userCode); // Carga todos los equipos
    this.filteredEquipments = this.equipments; // Muestra todos los equipos
  }
  openUserModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredUsers = this.users; // Muestra todos los usuarios
  }
  openConCopiaModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredConCopiaUsers = this.users; // Muestra todos los usuarios
  }

  getPhotoUrl(photo: string): string {
    return `${this.api}/img/equipment/${photo}`;
  }

  getUserDataByID(_id: string) {
    this.http.get(`${this.api}/users/get-user/${_id}`).subscribe((res: any) => {
      if (res) {
        this.selectedUser = res;
      } else {
        console.log('No se encontró un usuario con el id', _id);
      }
    });
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.isUserSelected = true;
    // this.altasbajasForm.get('directedId')?.setValue(user._id); // Set the id
    //this.filteredUsers = [];
    //this.getUserDataByID(userId); // Fetch additional user data
    this.modalController.dismiss();
  }

  searchEquipments(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredEquipments = this.equipments; // Muestra todos los equipos si el campo está vacío
    } else {
      this.filterEquipment(query); // Filtra según el término de búsqueda
    }
  }

  filterEquipment(searchTerm: string | null) {
    if (!searchTerm) {
      this.filteredEquipments = this.equipments;
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      this.filteredEquipments = this.equipments.filter((equip) => {
        const description = equip.description
          ? equip.description.toLowerCase()
          : '';
        const hdd = equip.hdd ? equip.hdd.toLowerCase() : '';
        return (
          description.includes(searchTermLower) || hdd.includes(searchTermLower)
        );
      });
    }
  }
  filterUser(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  selectEquipment(equipment: any) {
    this.selectedEquipment = equipment;
    this.isEquipmentSelected = true;
    this.altasbajasForm.get('equipmentId')?.setValue(equipment._id); // Set the ID of the selected equipment
    // this.filteredEquipments = [];
    this.modalController.dismiss();
    // Limpiar el search bar
    // const searchBar = document.querySelector(
    //   'ion-searchbar'
    // ) as HTMLIonSearchbarElement;
    // if (searchBar) {
    //   searchBar.value = ''; // Limpia el contenido del search bar
    // }
  }

  filterConCopiaUsers(query: string, page?: number, limit?: number) {
    if (query.length > 2) {
      this.http
        .get<PaginationResponse>(
          `${this.api}/users?limit=${limit}&page=${page}`
        )
        .subscribe((res: PaginationResponse) => {
          if (res && Array.isArray(res.data)) {
            this.filteredConCopiaUsers = res.data.filter((user: any) =>
              (user.name + ' ' + user.lastname)
                .toLowerCase()
                .includes(query.toLowerCase())
            );
          } else {
            this.filteredConCopiaUsers = [];
          }
        });
    } else {
      this.filteredConCopiaUsers = [];
    }
  }

  searchUsers(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredUsers = this.users; // Muestra todos los usuarios si el campo está vacío
    } else {
      this.filterUser(event);
    }
  }

  searchConCopia(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredConCopiaUsers = this.users; // Muestra todos los usuarios si el campo está vacío
    } else {
      this.filterConCopiaUsers(query, this.page, this.limit);
    }
  }

  removeConCopiaUser(index: number) {
    this.conCopiaUsers.splice(index, 1);
  }

  selectConCopiaUser(user: any) {
    this.selectedConCopiaUser = user;
    this.isConCopiaSelected = true;
    if (!this.conCopiaUsers.some((u) => u.userId === user.userId)) {
      this.conCopiaUsers.push(user);
    } else {
      this.presentToast('El usuario ya está en la lista de con copia');
    }
    this.modalController.dismiss();
  }

  async closeAltasBajasFormAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmar cierre',
      message: '¿Está seguro que desea cerrar sin guardar los cambios?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.modalController.dismiss();
          },
        },
      ],
    });
    await alert.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: `¿Estás seguro de que deseas terminar la redacción de la ${
        this.modalType === 'baja' ? 'baja' : 'alta'
      }?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.submitAltaBaja();
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'middle',
    });
    toast.present();
  }
  async presentAlertFinish(message: string) {
    const alert = await this.alertController.create({
      header: 'Exito',
      message: message,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            window.location.reload();
          },
        },
      ],
    });

    await alert.present();
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'En firmas';
      case 2:
        return 'Firmado';
      default:
        return '';
    }
  }

  submitAltaBaja() {
    this.isProgressVisible = true;

    const formData = this.altasbajasForm.value;

    const data: any = {
      equipmentId: formData.equipmentId,
      freeText: formData.freeText,
      ccp: this.conCopiaUsers.map((user) => user.userId),
    };

    const endpoint =
      this.modalType === 'baja'
        ? `${this.api}/ABT/baja`
        : `${this.api}/ABT/alta`;

    const interval = setInterval(() => {
      if (this.progress < 0.9) {
        this.progress += 0.1;
      } else {
        clearInterval(interval);
      }
    }, 500);

    this.http.post(endpoint, data).subscribe(
      (response) => {
        this.progress = 1;
        clearInterval(interval);

        this.presentAlertFinish(`${this.modalTitle} creado con éxito`);
        setTimeout(() => {
          this.isProgressVisible = false;
          this.progress = 0;
        }, 500);
      },
      async (error) => {
        clearInterval(interval);
        this.progress = 0;
        console.error(`Error al crear el ${this.modalTitle}:`, error);
        const errorMessage =
          error.error?.message || 'Ocurrió un error desconocido.';
        await this.presentAlertError(errorMessage);
      }
    );
  }

  onSubmit() {
    if (this.altasbajasForm.valid) {
      this.presentAlertConfirm();
    } else {
      this.presentToast('Por favor, complete todos los campos necesarios.');
    }
  }
  async presentAlertError(message: string) {
    const alert = await this.alertController.create({
      header: 'Intentarlo Más Tarde',
      message: message,
      buttons: [
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: () => {
            this.modalController.dismiss();
            this.isProgressVisible = false;
          },
        },
      ],
    });

    await alert.present();
  }
}
