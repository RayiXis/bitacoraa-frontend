/* eslint-disable @angular-eslint/component-selector */
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';

@Component({
  selector: 'modal-levantar-ticket',
  templateUrl: './modal-levantar-ticket.component.html',
  styleUrls: ['./modal-levantar-ticket.component.scss'],
})
export class ModalLevantarTicketComponent {
  public showModal: boolean = false;
  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];
  public solicitarServicioForm: FormGroup = this.fb.group({
    img: [''],
    problem: ['', Validators.required],
  });

  @ViewChild('fileInput') fileInput: any;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private bitacoraService: BitacoraService,
    private modalController: ModalController,
  ) {}

  inputImage() {
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }

    this.fileInput.nativeElement.click();
    const file = document.querySelector<HTMLInputElement>('#file');

    file?.addEventListener('change', (e) => {
      const fileInput = document.querySelector<HTMLInputElement>('#file');

      if (fileInput?.files) {
        const files = Array.from(fileInput.files);
        this.imageNames = files.map((file) => file.name); // Almacenar nombres de todas las imágenes
        if (files.length === 1) {
          this.txtDefault = files[0].name;
        } else if (files.length > 1) {
          this.txtDefault = this.imageNames.join(', '); // agreagr una coma al final del nombre de cada img si son más de una
        }
      }
    });
  }

  sendTicket() {
    if (this.solicitarServicioForm.invalid) {
      this.solicitarServicioForm.markAllAsTouched();
      return;
    }

    const fileInput = document.querySelector<HTMLInputElement>('#file');
    const problema = this.solicitarServicioForm.get('problem')!.value;
    const formData = new FormData();
    formData.append('reportDetail', problema);

    if (fileInput?.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append(`photoVideo`, fileInput.files[i]);
      }
    }
    this.bitacoraService.saveTicket(formData).subscribe({
      next: (response) => {
        this.showModal = false;
        this.presentTicketAlert(response.message);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async presentTicketAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Ticket Levantado',
      subHeader: message,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.txtDefault = 'Cargar Imágen';
            this.solicitarServicioForm.reset();
            this.modalController.dismiss();
          },
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async cancelSolicitud() {
    const alert = await this.alertController.create({
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
            this.solicitarServicioForm.reset();
            this.modalController.dismiss();
          },
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  isValidField(field: string): boolean | null {
    return (
      this.solicitarServicioForm.controls[field].errors &&
      this.solicitarServicioForm.controls[field].touched
    );
  }
}
