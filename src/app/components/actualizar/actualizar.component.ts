import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { PaginationResponse } from 'src/app/bitacora/interfaces/Bitacora';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-actualizar',
  templateUrl: './actualizar.component.html',
  styleUrls: ['./actualizar.component.scss'],
})
export class ActualizarComponent implements OnInit {
  abtactualizacionForm: FormGroup;
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

  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private bitacoraService: BitacoraService
  ) {
    this.abtactualizacionForm = this.formBuilder.group({
      userId: [''],
      equipmentId: [''],
      freeText: [''],
      ccp: [[]],
      sindicatura_Inventory_Code: [''],
      assigned_ip: ['', Validators.pattern(/^(\d{1,3}.){3}\d{1,3}$/)],
      description: [''],
      directionEthernet: [''],
      hdd: [''],
      photos: [[]],
    });
  }

  ngOnInit() {}

  //LOAD
  loadUser() {
    this.bitacoraService.getUserProfile().subscribe((profile) => {
      const authId = profile.authId; // Este es el valor que necesitas para filtrar

      this.bitacoraService.getUsers(1, 1000).subscribe((users) => {
        this.users = users.data.filter(
          (user) =>
            (user.status === 0 || user.status === 1) &&
            user.userId !== authId &&
            user.devices &&
            user.devices.length > 0
        );
        this.filteredUsers = this.users; // Actualizamos filteredUsers correctamente
      });
    });
  }

  loadEquipments() {
    this.bitacoraService.getEquipments(1, 1000).subscribe((equipments) => {
      this.equipments = equipments.data.filter(
        (equipments) => equipments.available === false
      );
      this.filteredEquipments = equipments.data;
    });
  }
  loadEquipmentsByUser(userId: string) {
    this.http
      .get<any[]>(`${this.api}/equipment/employee/${userId}`)
      .subscribe((equipments) => {
        console.log(equipments); // Check if photos exist in each equipment
        this.equipments = equipments.filter(
          (equipment) => equipment.available === false
        );
        this.filteredEquipments = equipments;
      });
  }
  inputImage() {
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }
    this.fileInput.nativeElement.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        this.imageNames = files.map((file) => file.name); // Almacenar nombres de todas las imágenes
        if (files.length === 1) {
          this.txtDefault = files[0].name;
        } else if (files.length > 1) {
          this.txtDefault = this.imageNames.join(', '); // agreagr una coma al final del nombre de cada img si son más de una
        }
      }
    });
  }
  /*----------------------------------------------------------------------------*/

  //FILTER
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

  /*---------------------------------------------------------------------------*/

  //OPEN MODAL
  openUserModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredUsers = this.users; // Muestra todos los usuarios
  }
  openEquipmentModal() {
    if (this.isUserSelected) {
      this.filterEquipment(''); // Filtra equipos basados en el texto vacío para mostrar todos
    }
  }
  openConCopiaModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredConCopiaUsers = this.users; // Asegúrate de que filteredConCopiaUsers esté siendo usado, no filterConCopiaUsers // Muestra todos los usuarios
  }
  /*-----------------------------------------------------------------------------*/

  //SELECT
  selectUser(user: any) {
    this.selectedUser = user;
    this.isUserSelected = true;
    this.abtactualizacionForm.patchValue({ userId: user.userId });
    this.loadEquipmentsByUser(user.userId); // Carga los equipos del usuario seleccionado

    // Restablecer el equipo seleccionado y el campo equipmentId
    this.selectedEquipment = null;
    this.isEquipmentSelected = false;
    this.abtactualizacionForm.get('equipmentId')?.setValue('');

    this.modalController.dismiss();
  }
  selectEquipment(equipment: any) {
    this.selectedEquipment = equipment;
    this.isEquipmentSelected = true;

    // Set the equipment details in the form
    this.abtactualizacionForm.patchValue({
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
  /*------------------------------------------------------------------------*/

  //SEARCH
  searchEquipments(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredEquipments = this.equipments; // Muestra todos los equipos si el campo está vacío
    } else {
      this.filterEquipment(query);
    }
  }
  /*-----------------------------------------------------------------------*/

  //ALERTS N TOASTS
  closeModal() {
    this.alert('Actualización de equipo', '¿Desea cancelar este proceso?', [
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
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La actualizacion del equipo se ha guardado correctamente.',
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
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'middle',
    });
    toast.present();
  }
  /*---------------------------------------------------------------------------*/
  onSubmit() {
    if (this.abtactualizacionForm.valid) {
      this.isProgressVisible = true;

      const formData = new FormData();

      const payload = {
        ...this.abtactualizacionForm.value,
        ccp:
          this.conCopiaUsers.length > 0
            ? this.conCopiaUsers.map((user) => user.userId)
            : [], // Asegúrate de que ccp siempre sea un arreglo
        userId: this.selectedUser.userId,
        equipmentId: this.selectedEquipment._id,
      };

      // Añadir los valores al formData (esto funciona con claves simples)
      for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
          if (Array.isArray(payload[key])) {
            payload[key].forEach((item: any) =>
              formData.append(`${key}[]`, item)
            );
          } else {
            formData.append(key, payload[key]);
          }
        }
      }

      // Añadir los archivos de photos al formData
      const fileInput = this.fileInput.nativeElement;
      if (fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append('photos', fileInput.files[i]);
        }
      }

      const interval = setInterval(() => {
        if (this.progress < 0.9) {
          this.progress += 0.1;
        } else {
          clearInterval(interval);
        }
      }, 500);

      this.http.post(`${this.api}/ABT/actualizar`, formData).subscribe({
        next: (response) => {
          this.progress = 1;
          clearInterval(interval);

          console.log('Equipo actualizado:', response);
          this.showSuccessAlertAndDismiss();
          setTimeout(() => {
            this.isProgressVisible = false;
            this.progress = 0;
          }, 500);
        },
        error: (error) => {
          clearInterval(interval);
          this.progress = 0;
          console.error('Error al actualizar el equipo:', error);
          // Manejo específico del error 403
          if (error.status === 403) {
            this.presentAlertError(
              'Tiene que ser un técnico o un administrador para realizar la actualización'
            );
          } else {
            // Mensaje de error genérico para otros códigos de error
            const errorMessage =
              error.error?.message || 'Ocurrió un error desconocido.';
            this.presentAlertError(errorMessage);
          }
        },
      });
    }
  }
}
