import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';
import { PaginationResponse } from 'src/app/bitacora/interfaces/Bitacora';

@Component({
  selector: 'app-return-comodato',
  templateUrl: './return-comodato.component.html',
  styleUrls: ['./return-comodato.component.scss'],
})
export class ReturnComodatoComponent implements OnInit {
  returnComodatoForm: FormGroup;
  public api = environment.apiUrl;
  public progress: number = 0;
  public isProgressVisible: boolean = false;

  public users: any[] = [];
  public filteredUsers: any[] = [];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  public equipments: any[] = [];
  filteredEquipments: any[] = [];
  selectedEquipment: any;
  public isEquipmentSelected: boolean = false;

  conCopiaUsers: any[] = [];
  filteredConCopiaUsers: any[] = [];
  selectedConCopiaUser: any;
  public isConCopiaSelected: boolean = false;

  public page: number = 1;
  public limit: number = 1000;
  public lastPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private bitacoraService: BitacoraService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.returnComodatoForm = this.formBuilder.group({
      equipmentId: [''],
      freeText: [''],
      ccp: [[]],
    });
  }

  ngOnInit() {
    this.loadUser();
    this.loadEquipments();
  }

  /*-------------------LOAD-------------------*/
  loadEquipments() {
    this.bitacoraService.getBorrowedEquipments().subscribe((equipments) => {
      this.equipments = equipments;
      this.filteredEquipments = equipments;
    });
  }
  loadUser() {
    this.bitacoraService.getUserProfile().subscribe((profile) => {
      const authId = profile.authId;

      this.bitacoraService.getUsers(1, 1000).subscribe((users) => {
        this.users = users.data.filter((users) => users.userId !== authId);
        this.filteredUsers = users.data;
      });
    });
  }
  /*-------------------OPEN MODAL---------------------------------*/
  openUserModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredUsers = this.users; // Muestra todos los usuarios
  }
  openEquipmentModal() {
    this.loadEquipments();
    this.filteredEquipments = this.equipments;
  }
  openConCopiaModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredConCopiaUsers = this.users;
  }

  /*----------------------FILTER-------------------------------*/
  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }
  filterEquipment(query: string) {
    if (query.length > 2) {
      this.filteredEquipments = this.equipments.filter((equipment: any) => {
        const description = equipment.description || ''; // Asegura que description nunca sea undefined
        return description.toLowerCase().includes(query.toLowerCase());
      });
    } else {
      this.filteredEquipments = this.equipments;
    }
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
      this.filteredConCopiaUsers = this.users; // Ajusta filteredConCopiaUsers en lugar de filterConCopiaUsers
    }
  }

  /*-----------------------SELECT-----------------------------------*/
  selectUser(user: any) {
    this.selectedUser = user;
    this.isUserSelected = true;
    this.modalController.dismiss();
  }
  selectEquipment(equipment: any) {
    this.selectedEquipment = equipment;
    this.isEquipmentSelected = true;

    // Set the equipment details in the form
    this.returnComodatoForm.patchValue({
      equipmentId: equipment._id,
      sindicatura_Inventory_Code: equipment.sindicatura_Inventory_Code,
      assigned_ip: equipment.assigned_ip,
      description: equipment.description,
      directionEthernet: equipment.directionEthernet,
      hdd: equipment.hdd,
      photos: equipment.photos,
    });

    this.modalController.dismiss();
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
  removeConCopiaUser(index: number) {
    this.conCopiaUsers.splice(index, 1);
  }
  //SEARCH
  searchEquipments(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredEquipments = this.equipments; // Muestra todos los equipos si el campo está vacío
    } else {
      this.filterEquipment(query);
    }
  }
  /*---------------------SUBMIT------------------------*/
  submit() {
    this.isProgressVisible = true;
    const formData = this.returnComodatoForm.value;
    const payload = {
      ...formData,
      equipmentId: this.selectedEquipment._id,
      ccp: this.conCopiaUsers.map((user) => user.userId),
    };

    const interval = setInterval(() => {
      if (this.progress < 0.9) {
        this.progress += 0.1;
      } else {
        clearInterval(interval);
      }
    }, 500);

    this.http.post(`${this.api}/ABT/regresar-comodato`, payload).subscribe(
      (response) => {
        this.progress = 1;
        clearInterval(interval);

        console.log('Comodato retornado:', response);
        this.showSuccessAlertAndDismiss();
        setTimeout(() => {
          this.isProgressVisible = false;
          this.progress = 0;
        }, 500);
      },
      (error) => {
        clearInterval(interval);
        this.progress = 0;
        console.error('Error al retornar comodato:', error);
        // Manejo específico del error 403
        if (error.status === 403) {
          this.presentAlertError(
            'Tiene que ser un director o un administrador para realizar el retorno de comodato'
          );
        } else {
          // Mensaje de error genérico para otros códigos de error
          const errorMessage =
            error.error?.message || 'Ocurrió un error desconocido.';
          this.presentAlertError(errorMessage);
        }
      }
    );
  }
  /*------------------ALERTS--------------------*/
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'middle',
    });
    toast.present();
  }
  async alert(header: string, message: string, btns: any[] = ['Ok']) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: btns,
    });
    await alert.present();
  }
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Se a realizado el retorno de comodato.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.modalController.dismiss();
            window.location.reload(); // Recargar la página
          },
        },
      ],
    });

    await alert.present();
  }
  async presentAlertError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
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
  closeModal() {
    this.alert(
      'Retorno de comodato',
      '¿Desea cancelar este proceso? Los cambios no se guardarán',
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
}
