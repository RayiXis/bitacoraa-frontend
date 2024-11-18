import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-vehiculo',
  templateUrl: './modal-vehiculo.component.html',
  styleUrls: ['./modal-vehiculo.component.scss'],
})
export class ModalVehiculoComponent implements OnInit {
  @Input() vehiculo: any;
  vehicleForm: FormGroup;

  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];
  public sindicaturaApi = environment.apiUrl;

  public users?: any[];
  public filteredUsers?: any[];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  public page: number = 1;
  public limit: number = 1000;
  public lastPage: number = 0;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient,
    private sindicaturaService: SindicaturaService
  ) {
    this.vehicleForm = this.formBuilder.group({
      userId: [''],
      unitNumber: [''],
      brand: [''],
      class: [''],
      model: [''],
      licensePlates: [''],
      color: [''],
      serialNumber: [''],
      observations: [''],
      location: [''],
      photos: [[]],
    });
  }

  ngOnInit() {
    if (this.vehiculo) {
      this.vehicleForm.patchValue({
        userId: this.vehiculo.userId,
        unitNumber: this.vehiculo.unitNumber,
        brand: this.vehiculo.brand,
        class: this.vehiculo.class,
        model: this.vehiculo.model,
        licensePlates: this.vehiculo.licensePlates,
        color: this.vehiculo.color,
        serialNumber: this.vehiculo.serialNumber,
        observations: this.vehiculo.observations,
        location: this.vehiculo.location,
      });
      if (this.vehiculo.photos) {
        this.imageNames = this.vehiculo.photos;
        this.txtDefault = this.imageNames.join(', ');
      }
    }
    this.sindicaturaService.getLoggedUser().subscribe({
      next: (response) => {
        this.vehicleForm.get('userId')?.setValue(response.authId);
      },
      error: (error) => {
        console.error('Error obteniendo usuario loggeado', error);
      },
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

  submit() {
    const formData = new FormData();
    const formValues = this.vehicleForm.value;

    // Añadir los campos básicos
    formData.append('userId', formValues.userId);
    formData.append('unitNumber', formValues.unitNumber);
    formData.append('brand', formValues.brand);
    formData.append('class', formValues.class);
    formData.append('model', formValues.model);
    formData.append('licensePlates', formValues.licensePlates);
    formData.append('color', formValues.color);
    formData.append('serialNumber', formValues.serialNumber);
    formData.append('observations', formValues.observations);
    formData.append('location', formValues.location);

    //Añadir los archivos de photos como un arreglo
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    }

    if (this.vehiculo) {
      //Llama al servicio para actualizar vehiculo
      this.sindicaturaService
        .updateVehiculo(this.vehiculo._id, formData)
        .subscribe({
          next: (response) => {
            console.log('Vehículo actualizado:', response);
            this.showSuccessAlertAndDismiss();
          },
          error: (error) => {
            console.error('Error actualizando el vehiculo', error);
            this.showErrorAlert();
          },
        });
    } else {
      // Llama al servicio para registrar el vehículo
      this.sindicaturaService.darAltaVehiculo(formData).subscribe({
        next: (response) => {
          console.log('Vehiculo registrado', response);
          this.showSuccessAlertAndDismiss();
        },
        error: (error) => {
          console.error('Error al registrar vehiculo', error);
          this.showErrorAlert();
        },
      });
    }
  }

  /*Acciones Modal*/
  close() {
    this.modalController.dismiss();
  }
  /******************************************************/

  /*Ion Alerts*/
  async closeVehicleFormAlert() {
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
        'Ocurrió un error al registrar el vehículo. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });

    await alert.present();
  }
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El vehículo se ha guardado correctamente.',
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
