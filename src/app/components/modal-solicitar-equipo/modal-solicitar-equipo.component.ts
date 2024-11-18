import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { Services } from 'src/app/bitacora/interfaces/Bitacora';
import { Equipos } from 'src/app/bitacora/interfaces/Equipos';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';

@Component({
  selector: 'modal-solicitar-equipo',
  templateUrl: './modal-solicitar-equipo.component.html',
  styleUrls: ['./modal-solicitar-equipo.component.scss'],
})
export class ModalSolicitarEquipoComponent implements OnInit {
  public servicios: Services[] = [];
  public equipos: Equipos[] = [];
  public currentDate: string = new Date().toISOString();
  public solicitarEquipoForm: FormGroup = this.fb.group({
    date: ['', Validators.required],
    hours: ['', Validators.required],
    equip: ['', Validators.required],
    place: ['', Validators.required],
    reason: ['', Validators.required],
  });

  private alertQueue: Promise<void> = Promise.resolve();
  private requestInProgress = false;

  @Input() requestSoli: any;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController,
    private bitacoraService: BitacoraService
  ) {}

  ngOnInit(): void {
    this.getAllEquips();
    if (this.requestSoli) {
      this.solicitarEquipoForm.patchValue({
        hours: this.requestSoli.useHours,
        equip: this.requestSoli.idEquipment,
        place: this.requestSoli.place,
        reason: this.requestSoli.reason,
      });
    }
  }

  adjustInitDate() {
    if (this.requestSoli?.initDate) {
      const originalDate = new Date(this.requestSoli.initDate);
      originalDate.setHours(originalDate.getHours() - 7);
      return originalDate.toISOString();
    }
    return null;
  }

  isValidField(field: string): boolean | null {
    return (
      this.solicitarEquipoForm.controls[field].errors &&
      this.solicitarEquipoForm.controls[field].touched
    );
  }

  formatDate(date: string): string {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    const hour = date.slice(11, 13);
    const minute = date.slice(14, 16);

    const formattedDate = `${day}/${month}/${year} ${hour}:${minute}`;
    return formattedDate;
  }

  formatEquipment(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  // Nueva función para convertir fechas en formato DD/MM/YYYY HH:MM a YYYY-MM-DDTHH:MM:SS
  convertToISOFormat(dateString: string): string {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  handleDateChange(value: any) {
    const selectedDate = this.formatDate(value);
    this.solicitarEquipoForm.patchValue({
      date: selectedDate,
    });
  }

  async sendSolicitud() {
    if (!this.solicitarEquipoForm.valid) {
      this.solicitarEquipoForm.markAllAsTouched();
      return;
    }

    this.requestInProgress = true; // Marcar la solicitud como en progreso

    // Obtener los valores del formulario
    const dateValue = this.solicitarEquipoForm.value.date;
    const hoursValue = parseInt(this.solicitarEquipoForm.value.hours);

    if (!dateValue) {
      console.error('Error: Date value is not provided.');
      this.requestInProgress = false;
      await this.queueAlert({
        header: 'Atención',
        subHeader: 'ha ocurrido un error',
        message: 'Por favor, proporciona una fecha válida.',
        buttons: ['OK'],
        backdropDismiss: false,
      });
      return;
    }

    const isoDate = this.convertToISOFormat(dateValue);
    const initDate = new Date(isoDate);
    if (isNaN(initDate.getTime())) {
      console.error('Error: Invalid date format.', dateValue);
      this.requestInProgress = false;
      await this.queueAlert({
        header: 'Atención',
        subHeader: 'ha ocurrido un error',
        message:
          'Formato de fecha inválido. Por favor, revisa la fecha seleccionada.',
        buttons: ['OK'],
        backdropDismiss: false,
      });
      return;
    }

    const endDate = new Date(initDate);
    endDate.setHours(initDate.getHours() + hoursValue);

    // Formatear la fecha para el campo `equipment` en formato `DD-MM-YYYY HH:MM`
    const formattedEquipmentDate = this.formatEquipment(initDate);

    // Convertir fechas a formato ISO para `initDate` y `endDate`
    const isoInitDate = initDate.toISOString();
    const isoEndDate = endDate.toISOString();

    const payload = {
      equipment: this.solicitarEquipoForm.value.equip,
      place: this.solicitarEquipoForm.value.place,
      reason: this.solicitarEquipoForm.value.reason,
      initDate: isoInitDate, // Formato ISO
      endDate: isoEndDate, // Formato ISO
    };

    if (this.requestSoli) {
      this.bitacoraService
        .updateRequest(this.requestSoli._id, payload)
        .subscribe(
          (res) => {
            this.queueAlert({
              header: 'ACTUALIZAR SOLICITUD DE EQUIPO',
              message: res.message,
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.modalController.dismiss();
                  },
                },
              ],
              backdropDismiss: false,
            });
          },
          (err) => {
            this.queueAlert({
              header: 'ACTUALIZAR SOLICITUD DE EQUIPO',
              subHeader: 'Algo incesperado ocurrio al actualizar la solicitud',
              message: err.message,
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.modalController.dismiss();
                  },
                },
              ],
              backdropDismiss: false,
            });
            console.error(err);
          }
        );
      return;
    }

    this.bitacoraService.requestEquipment(payload).subscribe({
      next: async (data) => {
        // Verificar si el equipo ya está apartado
        if (
          data?.message === 'Ya está apartado a esa hora' &&
          data?.availableFrom
        ) {
          // Mostrar alerta si el equipo está apartado
          await this.queueAlert({
            header: 'Solictar Equipo',
            subHeader: 'Equipo no se encuentra disponible',
            message: `El equipo ya se encuentra apartado. Estará disponible a partir de: ${new Date(
              data.availableFrom
            ).toLocaleString()}. Intente apartarlo para otra fecha u hora.`,
            buttons: ['OK'],
            backdropDismiss: false,
          });
        } else {
          // Mostrar alerta si la solicitud fue exitosa
          await this.queueAlert({
            header: 'Solictar Equipo',
            message: 'El equipo se ha solicitado correctamente.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  console.log(data);
                  this.modalController.dismiss();
                },
              },
            ],
            backdropDismiss: false,
          });
        }
        // Marcar la solicitud como completada
        this.requestInProgress = false;
      },
      error: async (error) => {
        console.error('Error al solicitar equipo', error);
        // Manejo del error general
        await this.queueAlert({
          header: 'Atención',
          subHeader: 'Ha ocurrido un error',
          message:
            'No se ha podido completar la solicitud del equipo. Intente nuevamente más tarde.',
          buttons: ['OK'],
          backdropDismiss: false,
        });
        this.requestInProgress = false; // Desmarcar la solicitud como en progreso
      },
    });
  }

  async queueAlert(options: any) {
    this.alertQueue = this.alertQueue.then(async () => {
      const alert = await this.alertController.create(options);
      await alert.present();
      await alert.onDidDismiss();
    });
    await this.alertQueue;
  }

  // async presentAlert(msg: string) {
  //   if (this.alertOpen) return;
  //   this.alertOpen = true;
  //   const alert = await this.alertController.create({
  //     header: 'Atención',
  //     subHeader: 'ha ocurrido un error',
  //     message: msg,
  //     buttons: ['OK'],
  //   });

  //   await alert.present();
  //   await alert.onDidDismiss();
  //   this.alertOpen = false;
  // }

  getAllEquips() {
    this.bitacoraService.getAllEquips(1, 1000).subscribe(
      (data) => {
        this.equipos = data.data.filter((equipo) => equipo.state);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async cancelSolicitud() {
    if (this.requestInProgress) return;

    await this.queueAlert({
      header: 'Confirmar',
      message: '¿Seguro que desea cancelar la solicitud?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // si el usuario cancela nos quedamos en el modal
          },
        },
        {
          text: 'Confirmar',
          handler: () => {
            // this.solicitarEquipoForm.reset();
            this.modalController.dismiss();
          },
        },
      ],
      backdropDismiss: false,
    });
  }

  // async presentEquipAlert() {
  //   if (this.alertOpen) return;
  //   this.alertOpen = true;
  //   const alert = await this.alertController.create({
  //     header: 'Equipo Solicitado',
  //     message: 'El equipo se ha solicitado correctamente.',
  //     buttons: [
  //       {
  //         text: 'Aceptar',
  //         handler: () => {
  //           this.solicitarEquipoForm.reset();
  //           this.closeModal.emit();
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  //   await alert.onDidDismiss();
  //   this.alertOpen = false;
  // }
}
