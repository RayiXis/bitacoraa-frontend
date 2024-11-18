import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';

import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';

@Component({
  selector: 'app-modal-direcciones',
  templateUrl: './modal-direcciones.component.html',
  styleUrls: ['./modal-direcciones.component.scss'],
})
export class ModalDireccionesComponent implements OnInit {
  @Input() direccion: any;
  @Input() dependencias: any[] = [];

  direccionForm: FormGroup;
  isEditMode: string | null = null;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private sindicaturaService: SindicaturaService,
    private https: HttpClient
  ) {
    this.direccionForm = this.formBuilder.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.direccion) {
      this.direccionForm.patchValue(this.direccion);
    }
    this.loadDependencia();
  }

  /*METODO PARA LLAMAR API*/
  private loadDireccion() {
    this.sindicaturaService.getDirecciones().subscribe(
      (data) => {
        this.direccion = data;
      },
      (error) => {
        console.error('Error al obtener direccion', error);
      }
    );
  }
  private loadDependencia() {
    this.sindicaturaService.getDependencias().subscribe(
      (data) => {
        this.dependencias = data.data;
      },
      (error) => {
        console.error('Error al obtener dependencias', error);
      }
    );
  }
  /*---------------------------------------------------------------------*/
  dismiss() {
    this.modalController.dismiss();
  }
  save() {
    if (this.direccionForm.valid) {
      const formData = this.direccionForm.value;

      if (this.direccion) {
        //Llama al servicio para actualizar direccion
        this.sindicaturaService
          .updateDireccion(this.direccion._id, formData)
          .subscribe(
            (response) => {
              console.log('Direccion actualizada', response);
              // this.modalController.dismiss(formData);
              this.showSuccessAlertAndDismiss();
            },
            (error) => {
              console.error('Error actualizando el vehiculo', error);
              this.showErrorAlert();
            }
          );
      } else {
        // Llama al servicio para registrar la direccion
        this.sindicaturaService.darAltaDireccion(formData).subscribe(
          (response) => {
            console.log('Vehículo registrado:', response);
            // this.modalController.dismiss(formData);
            this.showSuccessAlertAndDismiss();
          },
          (error) => {
            console.error('Error registrando el vehículo:', error);
            this.showErrorAlert();
          }
        );
      }
    }
  }
  /*ION-ALERTS*/
  async closeDirectionFormAlert() {
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
  /******************************************************/
  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message:
        'Ocurrió un error al registrar la direccion. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });

    await alert.present();
  }
  /* ION-ALERT */
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La dirección se ha guardado correctamente.',
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
  /*-------------------------------------------------------------------------------------*/
}
