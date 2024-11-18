import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertController,
  ToastController,
  ModalController,
} from '@ionic/angular';
import {
  Equipos,
  PaginationResponse,
} from 'src/app/bitacora/interfaces/Bitacora';

import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comodato',
  templateUrl: './comodato.component.html',
  styleUrls: ['./comodato.component.scss'],
})
export class ComodatoTraspasoComponent implements OnInit {
  comodatoForm: FormGroup;
  @Input() modalType: 'comodato' | 'traspaso' = 'comodato'; // Default to 'comodato'

  private api = environment.apiUrl;
  filteredDirectors: any[] = [];
  filteredUsers: any[] = [];
  filteredEquipments: any[] = [];
  filteredConCopiaUsers: any[] = [];

  public director: any[] = [];
  public users: any[] = [];
  public equipments: any[] = [];
  public conCopiaUsers: any[] = [];

  selectedDirector: any;
  selectedUser: any;
  selectedEquipment: any;
  selectedConCopiaUser: any;

  loggedUser: any;
  directorCode: any;

  public isDirectorSelected: boolean = false;
  public isUserSelected: boolean = false;
  public isConCopiaSelected: boolean = false;
  public isEquipmentSelected: boolean = false;

  modalTitle: string = 'Comodato';
  public progress: number = 0;
  public isProgressVisible = false;

  status: number = 0; // Asegúrate de actualizar este valor según el estado real del proceso

  public page: number = 1;
  public limit: number = 10;
  public lastPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private alertController: AlertController,
    private bitacoraService: BitacoraService,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.comodatoForm = this.formBuilder.group({
      newUserId: [''],
      equipmentId: [''],
      directedId: [''],
      freeText: [''],
      ccp: [[]],
      inventoryCode: [''],
    });
  }

  ngOnInit() {
    this.modalTitle = this.modalType === 'traspaso' ? 'Traspaso' : 'Comodato';
    this.getLoggedUser();
    this.loadABTUser();
    this.loadUser();
    this.loadEquipments(this.directorCode);
  }

  loadABTUser() {
    this.bitacoraService.getDirectors(1, 1000).subscribe((response) => {
      this.director = response.data;
      this.filteredDirectors = this.director;
    });
  }

  loadUser() {
    this.bitacoraService.getUsers(1, 1000).subscribe(
      (response) => {
        console.log('Usuarios cargados:', response.data);
        this.users = response.data.filter(
          (users) => users.status === 0 || users.status === 1
        );
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }
  loadEquipments(code: string) {
    this.bitacoraService.getEquipmentByCode(code).subscribe(
      (equipments) => {
        this.equipments = equipments;
        this.filteredEquipments = equipments;
      },
      (error) => {
        console.error('Error al cargar los equipos', error);
      }
    );
  }
  openUserModal() {
    if (this.selectedDirector && this.selectedDirector.code) {
      const directorCode = this.selectedDirector.code; // Obtén el código del director seleccionado
      this.loadEmployeesByAdministrativeUnitCode(directorCode); // Carga todos los usuarios
    } else {
      console.error('No se ha seleccionado ningún director.');
    }
  }
  openDirectorModal() {
    this.loadABTUser(); // Carga todos los usuarios
  }
  openEquipmentModal() {
    this.loadEquipments(this.loggedUser.code); // Carga todos los equipos
  }

  openConCopiaModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredConCopiaUsers = this.users.filter(
      (user) => user.userId !== this.loggedUser.authId
    );
  }

  getLoggedUser() {
    this.http.get(`${this.api}/users/profile`).subscribe((res: any) => {
      this.loggedUser = res;
      // Asigna el userId del usuario logueado al campo directedId del formulario
      if (this.loggedUser && this.loggedUser.authId) {
        // Cargar equipos del usuario logueado
        this.loadEquipments(this.loggedUser.code);
      } else {
        console.error('No se pudo obtener el ID del usuario logueado.');
      }
    });
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

  async presentAlertConfirm() {
    const message =
      this.modalType === 'traspaso'
        ? '¿Estás seguro de que deseas terminar la redacción del traspaso?'
        : '¿Estás seguro de que deseas terminar la redacción del comodato?';
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.submitComodato();
          },
        },
      ],
    });

    await alert.present();
  }

  async closeEquipmentFormAlert() {
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

  getPhotoUrl(photo: string): string {
    return `${this.api}/img/equipment/${photo}`;
  }

  getUserDataByID(userId: string) {
    this.http
      .get(`${this.api}/users/get-user/${userId}`)
      .subscribe((res: any) => {
        if (res) {
          this.selectedUser = res;
          this.comodatoForm.patchValue({
            name: res.name || 'No disponible', // Handle missing data
            lastname: res.lastname || 'No disponible', // Handle missing data
          });
        } else {
          console.log('No se encontró un usuario con el id', userId);
        }
      });
  }

  filterDirector(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (this.director && Array.isArray(this.director)) {
      this.filteredDirectors = this.director.filter(
        (director) =>
          director.name.toLowerCase().includes(searchTerm) ||
          director.lastname.toLowerCase().includes(searchTerm)
      );
    }
  }
  filterUser(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (this.users && Array.isArray(this.users)) {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.lastname.toLowerCase().includes(searchTerm)
      );
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

  searchEquipments(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredEquipments = this.equipments; // Muestra todos los equipos si el campo está vacío
    } else {
      this.filterEquipments(query);
    }
  }

  filterEquipments(searchTerm: string) {
    if (!searchTerm) {
      this.filteredEquipments = [...this.equipments];
      return;
    }
    this.filteredEquipments = this.equipments.filter(
      (equipment) =>
        equipment.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        equipment.hdd.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  selectDirector(director: any) {
    this.selectedDirector = director;
    this.directorCode = director.code;
    console.log('Código del director seleccionado:', this.directorCode);
    this.isDirectorSelected = true;
    this.comodatoForm.patchValue({ directedId: director.userId });
    this.modalController.dismiss();

    if (this.directorCode) {
      this.bitacoraService
        .getEquipmentByCode(this.directorCode)
        .subscribe((equipments: any[]) => {
          if (equipments && Array.isArray(equipments)) {
            this.filteredEquipments = equipments;
          } else {
            this.filteredEquipments = [];
          }
          console.log(
            'Equipos filtrados por unidad administrativa:',
            this.filteredEquipments
          );
        });

      this.loadEmployeesByAdministrativeUnitCode(this.directorCode);
    } else {
      console.error('El código del director no está definido.');
    }
  }

  // Función para cargar los empleados por unidad administrativa
  loadEmployeesByAdministrativeUnitCode(directorCode: string) {
    this.bitacoraService
      .getUsersByAdministrativeUnitCode(directorCode)
      .subscribe(
        (response: string[]) => {
          console.log('Respuesta completa del servicio de usuarios:', response);
          if (response && response.length > 0) {
            // Filtra ID válidos
            const validUserIds = response.filter((userId) => !!userId);

            if (validUserIds.length === 0) {
              console.error('No se encontraron IDs de usuarios válidos.');
              this.filteredUsers = [];
              return;
            }

            // Solicita detalles de cada usuario
            const userDetailsRequests = validUserIds.map((userId) =>
              this.http.get(`${this.api}/users/get-user/${userId}`).toPromise()
            );

            // Ejecuta todas las solicitudes en paralelo
            Promise.all(userDetailsRequests)
              .then((userDetails: any[]) => {
                this.filteredUsers = userDetails.map((user) => ({
                  id: user?.id || 'ID no disponible',
                  fullname: `${user?.name || 'Nombre no disponible'} ${
                    user?.lastname || 'Apellido no disponible'
                  }`,
                  email: `${user?.email || 'Email no disponible'}`,
                  direccionName: `${user?.administrativeUnitName}`,
                  job: `${user?.workstation || 'Puesto no disponible'}`,
                }));
                console.log(
                  'Usuarios filtrados por unidad administrativa:',
                  this.filteredUsers
                );
              })
              .catch((error) => {
                console.error(
                  'Error al obtener los detalles de los usuarios:',
                  error
                );
                this.filteredUsers = [];
              });
          } else {
            this.filteredUsers = [];
            console.log(
              'No se encontraron usuarios para el código de unidad administrativa.'
            );
          }
        },
        (error) => {
          console.error(
            'Error al cargar usuarios por unidad administrativa:',
            error
          );
        }
      );
  }

  selectUser(user: any) {
    const userId = user.id;
    this.selectedUser = user;
    this.isUserSelected = true;
    this.modalController.dismiss();
    // Asegúrate de que 'directedId' en el formulario se actualice con el 'userId' seleccionado
    this.comodatoForm.patchValue({
      comodatoId: userId,
      newUserId: userId, // Actualiza el campo dirigido a con el userId del empleado seleccionado
    });
  }

  selectEquipment(equipment: any) {
    this.selectedEquipment = equipment;
    this.isEquipmentSelected = true;
    this.comodatoForm.patchValue({
      equipmentId: equipment._id || '',
      inventoryCode: equipment.sindicatura_Inventory_Code || '',
    });
    this.modalController.dismiss();
    console.log('Equipo seleccionado:', this.selectedEquipment);
  }
  // En tu componente TypeScript
  onEquipmentSelected(equipment: any) {
    this.selectedEquipment = equipment;

    if (this.modalType === 'traspaso') {
      this.comodatoForm
        .get('inventoryCode')
        ?.setValue(equipment.sindicatura_Inventory_Code);
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
      this.filteredConCopiaUsers = this.users;
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

  onSubmit() {
    if (this.comodatoForm.valid) {
      console.log('Equipment ID:', this.comodatoForm.get('equipmentId')?.value); // Verifica el valor
      this.presentAlertConfirm();
    } else {
      this.presentToast('Por favor, complete todos los campos necesarios.');
    }
  }
  submitComodato() {
    this.isProgressVisible = true;
    if (this.comodatoForm.valid) {
      const formData = this.comodatoForm.value;
      // Determina el comodatoId en función de la selección
      if (this.isUserSelected && this.selectedUser) {
        formData.comodatoId = this.selectedUser.id;
        formData.newUserId = this.selectedUser.id; // Si hay empleado seleccionado, usar su userId
      } else if (this.isDirectorSelected && this.selectedDirector) {
        formData.comodatoId = this.selectedDirector.userId; // Si hay director seleccionado, usar su userId
      } else {
        formData.comodatoId = null; // Manejo de caso en el que no se selecciona ni empleado ni director
      }
      // formData.directedId = this.loggedUser?.authId; // Maneja posible 'null'
      formData.directedId = this.selectedDirector?.userId;
      formData.equipmentId = this.selectedEquipment?._id; // Maneja posible 'null'
      formData.inventoryCode =
        this.selectedEquipment?.sindicatura_Inventory_Code;
      formData.ccp = this.conCopiaUsers.map((user) => user.userId);

      let endpoint = '';
      const interval = setInterval(() => {
        if (this.progress < 0.9) {
          this.progress += 0.1;
        } else {
          clearInterval(interval);
        }
      }, 500);

      if (this.modalType === 'comodato') {
        endpoint = `${this.api}/ABT/comodato`;
        delete formData.newUserId;
        delete formData.inventoryCode;
      } else if (this.modalType === 'traspaso') {
        endpoint = `${this.api}/ABT/traspaso`;
        formData.newUserId = this.selectedUser?.id;
        formData.inventoryCode;
        formData.equipmentId;
        delete formData.comodatoId;
      }

      this.http.post(endpoint, formData).subscribe(
        (res: any) => {
          this.progress = 1;
          clearInterval(interval);
          this.presentAlertFinish('Redacción completada exitosamente.');
          setTimeout(() => {
            this.isProgressVisible = false;
            this.progress = 0;
          }, 500);
        },
        async (err) => {
          clearInterval(interval);
          this.progress = 0;
          // Extrae el mensaje del backend
          const errorMessage =
            err.error?.message || 'Ocurrió un error desconocido.';
          await this.presentAlertError(errorMessage);
        }
      );
    } else {
      this.presentToast('Por favor, complete todos los campos necesarios.');
    }
  }

  async presentAlertError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: [
        {
          text: 'OK',
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
