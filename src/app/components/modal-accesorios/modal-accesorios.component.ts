import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';

import { CatalogosService } from 'src/app/services/catalogos/catalogos.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-accesorios',
  templateUrl: './modal-accesorios.component.html',
  styleUrls: ['./modal-accesorios.component.scss'],
})
export class ModalAccesoriosComponent implements OnInit {
  @Input() accesorio: any;
  @ViewChild('fileInput') fileInput!: ElementRef;
  accesorioForm: FormGroup;

  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];

  public catalogoApi = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private http: HttpClient,
    private catalogosService: CatalogosService
  ) {
    this.accesorioForm = this.formBuilder.group({
      inventoryNumber: ['', Validators.required],
      type: [''],
      description: [''],
      ip: ['', Validators.pattern(/^(\d{1,3}.){3}\d{1,3}$/)],
      photos: [[]],
    });
  }

  ngOnInit() {
    if (this.accesorio) {
      this.accesorioForm.patchValue({
        inventoryNumber: this.accesorio.inventoryNumber,
        type: this.accesorio.type,
        description: this.accesorio.description,
        ip: this.accesorio.ip,
      });
      if (this.accesorio.photos) {
        this.imageNames = this.accesorio.photos;
        this.txtDefault = this.imageNames.join(', ');
      }
    }
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

  /*METODO PARA LLAMAR API*/
  private loadAccesorio() {
    this.catalogosService.getAccesory().subscribe(
      (data) => {
        this.accesorio = data;
      },
      (error) => {
        console.error('Error al obtener accesorios', error);
      }
    );
  }

  submit() {
    const formData = new FormData();
    const formValues = this.accesorioForm.value;

    // Añadir los campos básicos
    formData.append('inventoryNumber', formValues.inventoryNumber);
    formData.append('type', formValues.type);
    formData.append('description', formValues.description);
    formData.append('ip', formValues.ip);

    //Añadir los archivos de photos como un arreglo
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    }

    if (this.accesorio) {
      this.catalogosService
        .updateAccesory(this.accesorio._id, formData)
        .subscribe({
          next: (response) => {
            console.log('Accesorio actualizado', response);
            this.showSuccessAlertAndDismiss();
          },
          error: (error) => {
            console.error('Error actualizando accesorio', error);
            this.showErrorAlert();
          },
        });
    } else {
      this.catalogosService.darAltaAccesorio(formData).subscribe({
        next: (response) => {
          console.log('Accesorio registrado', response);
          this.showSuccessAlertAndDismiss();
        },
        error: (error) => {
          console.error('Error registrando el accesorio', error);
          this.showErrorAlert();
        },
      });
    }
  }

  /*ACCIONES MODAL*/
  close() {
    this.modalController.dismiss();
  }

  /*ION ALERTS*/
  async closeAccesorioFormAlert() {
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
  /*-------------------------------------------------------------*/
  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message:
        'Ocurrió un error al registrar el accesorio. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El accesorio se ha guardado correctamente.',
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
