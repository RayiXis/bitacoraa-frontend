import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';

@Component({
  selector: 'app-modal-dependencias',
  templateUrl: './modal-dependencias.component.html',
  styleUrls: ['./modal-dependencias.component.scss'],
})
export class ModalPuestoComponent {
  @Input() dependencia: any;
  @Input() dependencias: any[] = [];

  form: FormGroup;
  name: string = '';
  selectedDependencia: string | null = null;
  isEditMode: string | null = null;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private sindicaturaService: SindicaturaService
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      code: [''],
      selectedDependencia: [''],
    });
  }

  ngOnInit() {
    if (this.dependencia) {
      this.form.patchValue({
        name: this.dependencia.name,
        code: this.dependencia.code,
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    const dependenciaUpdateData = {
      code: this.form.value.code,
      name: this.form.value.name,
    };

    if (this.dependencia) {
      // Si existe dependencia, actualizarla
      const dependenciaId = this.dependencia._id;
      this.sindicaturaService
        .updateDependencia(dependenciaId, dependenciaUpdateData)
        .subscribe((response) => {
          // this.modalController.dismiss(response);
          this.showSuccessAlertAndDismiss();
        });
    } else {
      // Si no existe dependencia, crear una nueva
      this.sindicaturaService
        .darAltaDependencia(dependenciaUpdateData)
        .subscribe((response) => {
          // this.modalController.dismiss(response);
          this.showSuccessAlertAndDismiss();
        });
    }
  }
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement instanceof HTMLInputElement) {
      const value = inputElement.value;
      this.form.patchValue({ name: value });
    }
  }

  onDependenciaChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement instanceof HTMLSelectElement) {
      const value = selectElement.value;
      this.form.patchValue({ selectedDependencia: value });
    }
  }
  /*Ion-Alerts*/
  async closeModalAlert() {
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
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La dependencia se ha guardado correctamente.',
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
