import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { CatalogosService } from 'src/app/services/catalogos/catalogos.service';
import { environment } from 'src/environments/environment';
import {
  PaginationResponse,
  UserEmployee,
  UserTechnical,
} from 'src/app/bitacora/interfaces/Bitacora';
import { jwtDecode } from 'jwt-decode';

interface TelephoneData {
  ip: string;
  telephoneNumber: number;
  userId: string;
  place: string;
  [key: string]: string | number; // Firma de índice para permitir el acceso dinámico
}

@Component({
  selector: 'app-perifericos',
  templateUrl: './perifericos.component.html',
  styleUrls: ['./perifericos.component.scss'],
})
export class PerifericosComponent implements OnInit {
  @Input() periferico: any;
  isEditing: boolean = false;
  public userRole: string | null = null;
  public datosUsuario: UserEmployee | UserTechnical | null = null;
  peripheralForm: FormGroup;
  public api = environment.apiUrl;
  peripheral: any[] = [];
  filteredUsers: any[] = [];
  public users: any[] = [];
  filteredPeripheral: any[] = [];
  selectedUser: any;
  public isUserSelected: boolean = false;
  selectedPeripheralType: string = '';

  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;

  telephoneData: TelephoneData = {
    ip: '',
    telephoneNumber: 0,
    userId: '',
    place: '',
  };
  loggedUser: any;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  public page: number = 1;
  public limit: number = 10;
  public lastPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient,
    private catalogosService: CatalogosService
  ) {
    this.peripheralForm = this.formBuilder.group({
      inventoryCode: ['', Validators.required],
      description: ['', Validators.required],
      ip: ['', Validators.pattern(/^(\d{1,3}.){3}\d{1,3}$/)],
      type: ['', Validators.required],
      // userId: [''],
      location: [''],
      photos: [],
    });
  }

  inputImage() {
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      this.imageNames = files.map((file) => file.name); // Almacenar nombres de todas las imágenes
      if (files.length === 1) {
        this.txtDefault = files[0].name;
      } else if (files.length > 1) {
        this.txtDefault = this.imageNames.join(', '); // Mostrar nombres de todas las imágenes separadas por coma
      }
    }
  }
  ngOnInit() {
    this.isEditing = !!this.periferico;
    if (this.isEditing) {
      this.peripheralForm.patchValue({
        inventoryCode: this.periferico.inventoryCode,
        description: this.periferico.description,
        ip: this.periferico.ip,
        type: this.periferico.type,
        location: this.periferico.location,
        // userId: this.periferico.userId,
      });
      if (this.periferico.photos) {
        this.imageNames = this.periferico.photos;
        this.txtDefault = this.imageNames.join(', ');
      }
    }
    // this.catalogosService.currentEmployee().subscribe({
    //   next: (response) => {
    //     this.peripheralForm.get('userId')?.setValue(response.userId);
    //   },
    //   error: (error) => {
    //     console.error('Error obteniendo usuario loggeado', error);
    //   },
    // });
  }

  loadUser() {
    this.catalogosService.getUsers(1, 1000).subscribe((users) => {
      this.users = users.data;
      this.filteredUsers = users.data;
    });
  }
  openUserModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredUsers = this.users; // Muestra todos los usuarios
  }

  getLoggedUser() {
    this.http.get(`${this.api}/users/profile`).subscribe((res: any) => {
      this.loggedUser = res;
    });
  }

  private loadPeriferico(page: number, limit: number) {
    this.catalogosService.getPeripheral(page, limit).subscribe(
      (data) => {
        this.periferico = data;
        this.page = data.meta.page;
        this.lastPage = data.meta.lastPage;
        this.filterPeripheral();
      },
      (error) => {
        console.error('Error al obtener perifericos', error);
      }
    );
  }

  searchUsers(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredUsers = this.users; // Muestra todos los usuarios si el campo está vacío
    } else {
      this.filterUser(event);
    }
  }

  initialUserSearch() {
    const query = '';
    this.filterUser(query);
  }

  filterUser(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  private filterPeripheral() {
    this.filteredPeripheral = this.peripheral.filter((peripheral) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && peripheral.isActive) ||
        (this.filterStatus === 'inactive' && !peripheral.isActive);
      return statusMatch;
    });
  }

  selectUser(user: any) {
    const userId = user._id;
    this.selectedUser = user;
    this.isUserSelected = true;
    this.peripheralForm.get('userId')?.setValue(userId);
    this.getUserDataByID(userId); // Fetch additional user data
    this.filteredUsers = this.users;
    this.modalController.dismiss();
  }

  getUserDataByID(_id: string) {
    this.http.get(`${this.api}/users/get-user/${_id}`).subscribe((res: any) => {
      if (res) {
        this.selectedUser = res;
        this.peripheralForm.patchValue({
          dependencia: res.dependence || 'No disponible', // Handle missing data
          direccion: res.direction || 'No disponible', // Handle missing data
        });
      } else {
        console.log('No se encontró un usuario con el id', _id);
      }
    });
  }

  updatePeripheralType(event: any) {
    this.selectedPeripheralType = event.detail.value;
  }

  updateTelephoneData(field: string, event: any) {
    if (field === 'telephoneNumber') {
      this.telephoneData[field] = event.target.valueAsNumber;
    } else {
      this.telephoneData[field] = event.target.value;
    }
  }

  async closePerifericosFormAlert() {
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

  submit() {
    const formData = new FormData();
    const formValues = this.peripheralForm.value;

    // Añadir los campos básicos
    //formData.append('userId', formValues.userId);
    formData.append('inventoryCode', formValues.inventoryCode);
    formData.append('description', formValues.description);
    formData.append('ip', formValues.ip);
    formData.append('type', formValues.type);
    formData.append('location', formValues.location);

    //Añadir los archivos de photos como un arreglo
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    }

    if (this.isEditing) {
      // Llama al servicio para actualizar el periferico
      this.catalogosService
        .updatePeriferico(this.periferico._id, formData)
        .subscribe({
          next: (response) => {
            console.log('Periferico actualizado:', response);
            this.showSuccessAlertAndDismiss();
          },
          error: (error) => {
            console.error('Error actualizando el periferico:', error);
            this.showErrorAlert();
          },
        });
    } else {
      // Llama al servicio para registrar el mueble
      this.catalogosService.darAltaPeriferico(formData).subscribe({
        next: (response) => {
          console.log('Periferico registrado:', response);
          this.showSuccessAlertAndDismiss();
        },
        error: (error) => {
          console.error('Error registrando el periferico:', error);
          this.showErrorAlert();
        },
      });
    }
  }

  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message:
        'Ocurrió un error al registrar periferico. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });

    await alert.present();
  }
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El periferico se ha guardado correctamente.',
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
}
