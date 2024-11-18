import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { UserEmployee } from 'src/app/bitacora/interfaces/Bitacora';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.scss'],
})
export class PermisosComponent implements OnInit {
  @Input() userId: string = '';
  userFullName: string = '';
  phoneNumber: string = ''; // Para almacenar el número de teléfono
  phoneError: boolean = false; // Estado para mostrar el error de validación

  // Recibe el userId como Input
  currentRole: string = ''; // Para almacenar el rol actual del usuario
  newRole: string = ''; // Para almacenar el nuevo rol seleccionado

  selectedUrgencyLevel: number = 0; // Para almacenar el nivel de urgencia seleccionado
  currentUrgencyLevel: number = 0; // Para almacenar el nivel de urgencia actual

  isAbtActive: string = ''; // Para manejar el estado del toggle ABT
  currentAbtActive: string = ''; // Para almacenar el estado actual del toggle ABT

  canRequestDevices: boolean = false; // Para manejar el estado del toggle de solicitar equipo
  currentCanRequestDevices: boolean = false; // Para almacenar el estado actual del toggle de solicitar equipo

  private api = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private bitacoraService: BitacoraService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    if (!this.userId) {
      console.error('El userDataId no está definido.');
      return;
    }
    // Asegurarse de que userDataId es un string válido
    console.log('Cargando datos para userDataId:', this.userId);
    this.bitacoraService.getUserDataById(this.userId).subscribe(
      (user: UserEmployee | null) => {
        if (user) {
          this.userFullName = `${user.name} ${user.lastname}`;
          console.log('Nombre completo del usuario:', this.userFullName);

          // Asignar el número de teléfono
          this.phoneNumber = user.phone || ''; // Asignar el teléfono, si no existe, inicializarlo con una cadena vacía

          this.currentRole = user.type; // Asignar el rol actual
          this.newRole = this.currentRole; // Inicialmente, el nuevo rol es el mismo

          this.selectedUrgencyLevel = user.urgencyLevel; // Asignar el nivel de urgencia actual
          this.currentUrgencyLevel = this.selectedUrgencyLevel; // Almacenar el nivel de urgencia actual

          this.currentAbtActive = user.abt; // Asignar el valor actual de ABT
          this.isAbtActive = this.currentAbtActive; // Inicializar isAbtActive con el valor actual

          this.currentCanRequestDevices = user.canRequestDevices; // Asignar el estado actual del toggle de solicitar equipo
          this.canRequestDevices = this.currentCanRequestDevices; // Inicializar canRequestDevices con el estado actual

          console.log('ABT actual cargado:', user.abt);
          console.log('Valor de ABT actual:', this.currentAbtActive);
          console.log('Nivel de urgencia cargado:', this.selectedUrgencyLevel);
          console.log(
            'Can Request Devices cargado:',
            this.currentCanRequestDevices
          );
        } else {
          console.error(
            'No se encontraron datos para el usuario con ID:',
            this.userId
          );
          this.alert('Error', 'No se encontraron datos para el usuario.');
        }
      },
      (error) => {
        console.error('Error al cargar el rol del usuario', error);
        this.alert(
          'Error',
          'Ocurrió un error al cargar los datos del usuario.'
        );
      }
    );
  }

  onCanRequestToggleChange(event: any) {
    this.canRequestDevices = event.detail.checked;
  }

  validatePhoneNumber() {
    // Validar que el número de teléfono tenga exactamente 10 dígitos
    const phoneRegex = /^\d{10}$/;
    this.phoneError = !phoneRegex.test(this.phoneNumber);
  }

  /*---------------------SUBMIT------------------------*/
  submit() {
    const updateRequests: any[] = [];

    // Validar el teléfono antes de realizar la solicitud
    if (!this.phoneError && this.phoneNumber) {
      updateRequests.push(
        this.http.patch(
          `${this.api}/users/add-phone/${this.userId}/${this.phoneNumber}`,
          {},
          { responseType: 'text' }
        )
      );
    }

    // updateRequests.push(
    //   this.http.patch(
    //     `${this.api}/users/add-phone/${this.userId}/${this.phoneNumber}`,
    //     {},
    //     { responseType: 'text' }
    //   )
    // );

    // Comprobar si el rol ha cambiado
    if (this.newRole !== this.currentRole) {
      updateRequests.push(
        this.http.patch(
          `${this.api}/users/change-role/${this.userId}/${this.newRole}`,
          {},
          { responseType: 'text' } // Ajustar el tipo de respuesta esperado
        )
      );
    }

    // Comprobar si el nivel de urgencia ha cambiado
    if (this.selectedUrgencyLevel !== this.currentUrgencyLevel) {
      updateRequests.push(
        this.http.patch(
          `${this.api}/users/edit-urgency-level`,
          {
            id: this.userId,
            urgencyLevel: Number(this.selectedUrgencyLevel),
          },
          { responseType: 'text' }
        )
      );
    }
    // Comprobar si el estado del toggle ABT ha cambiado
    if (this.isAbtActive !== this.currentAbtActive) {
      updateRequests.push(
        this.http.patch(
          `${this.api}/users/change-abt/${this.userId}/${this.isAbtActive}`,
          {},
          { responseType: 'text' }
        )
      );
    }
    // Comprobar si el estado del toggle Can Request Devices ha cambiado
    if (this.canRequestDevices !== this.currentCanRequestDevices) {
      updateRequests.push(
        this.http.patch(
          `${this.api}/users/can-request-devices/${this.userId}/${this.canRequestDevices}`,
          {},
          { responseType: 'text' }
        )
      );
    }
    // Ejecutar todas las solicitudes de actualización
    if (updateRequests.length > 0) {
      forkJoin(updateRequests).subscribe(
        (responses) => {
          console.log('Respuestas del backend:', responses);
          this.showSuccessAlertAndDismiss();
        },
        (error) => {
          console.error('Error al actualizar los datos del usuario', error);
          this.alert(
            'Error',
            'No se pudieron actualizar los datos del usuario.'
          );
        }
      );
    } else {
      this.alert('Aviso', 'No se realizaron cambios.');
    }
  }
  /*------------------ALERTS--------------------*/
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
      message: 'Permisos de usuario han sido actualizados.',
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
  closeModal() {
    this.alert(
      'Configuracion de usuario',
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
