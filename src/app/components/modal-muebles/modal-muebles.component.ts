import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';

import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-muebles',
  templateUrl: './modal-muebles.component.html',
  styleUrls: ['./modal-muebles.component.scss'],
})
export class ModalMueblesComponent implements OnInit {
  @Input() mueble: any;
  muebleForm: FormGroup;
  public sindicaturaApi = environment.apiUrl;
  @ViewChild('fileInput') fileInput!: ElementRef;
  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];

  public users?: any[];
  public filteredUsers?: any[];
  public selectedUser: any;
  public isUserSelected: boolean = false;

  public page: number = 1;
  public limit: number = 1000;
  public lastPage: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private sindicaturaService: SindicaturaService
  ) {
    this.muebleForm = this.formBuilder.group({
      propertyKey: [''],
      descriptionBrand: [''],
      serialNumber: [''],
      color: [''],
      actualState: [''],
      invoiceNumber: [''],
      observations: [''],
      location: [''],
      photos: [[]],
    });
  }

  ngOnInit() {
    if (this.mueble) {
      this.muebleForm.patchValue(this.mueble);
      console.log('Valores iniciales del formulario:', this.muebleForm.value);
      if (this.mueble.photos) {
        this.imageNames = this.mueble.photos;
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
  //LOAD
  loadUser() {
    this.sindicaturaService.getUsers(1, 1000).subscribe((users) => {
      this.users = users.data;
      this.filteredUsers = users.data;
    });
  }
  private loadMuebles() {
    this.sindicaturaService.getMuebles().subscribe(
      (data) => {
        this.mueble = data;
      },
      (error) => {
        console.error('Error al obtener muebles', error);
      }
    );
  }
  //FILTER
  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }
  //OPEN MODAL
  openUserModal() {
    this.loadUser(); // Carga todos los usuarios
    this.filteredUsers = this.users; // Muestra todos los usuarios
  }
  //SELECT
  selectUser(user: any) {
    this.selectedUser = user;
    this.isUserSelected = true;
    this.muebleForm.get('userId')?.setValue(user._id);
    this.modalController.dismiss();
  }

  submit() {
    const formData = new FormData();
    const formValues = this.muebleForm.value;

    // Verifica los valores del formulario antes de enviarlos
    console.log('Valores del formulario al enviar:', formValues);

    // Añadir los campos básicos
    formData.append('propertyKey', formValues.propertyKey);
    formData.append('descriptionBrand', formValues.descriptionBrand);
    formData.append('serialNumber', formValues.serialNumber);
    formData.append('color', formValues.color);
    formData.append('actualState', formValues.actualState);
    formData.append('invoiceNumber', formValues.invoiceNumber);
    formData.append('observations', formValues.observations);
    formData.append('location', formValues.location);
    //Añadir los archivos de photos como un arreglo
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    }
    if (this.mueble) {
      console.log('Actualizando mueble con id:', this.mueble._id);
      // Llama al servicio para actualizar el mueble
      this.sindicaturaService.updateMueble(this.mueble._id, formData).subscribe(
        async (response) => {
          console.log('Mueble actualizado:', response);
          this.modalController.dismiss(formData);
          //Emitir evento de actualizacion
          const alert = this.alertController.create({
            header: 'Actualización',
            message: 'El bien mobiliario ha sido actualizado correctamente.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  window.location.reload(); // Recargar la página
                },
              },
            ],
          });
          (await alert).present();
        },
        (error) => {
          console.error('Error actualizando el mueble:', error);
          this.showErrorAlert();
        }
      );
    } else {
      // Llama al servicio para registrar el mueble
      this.sindicaturaService.darAltaMueble(formData).subscribe(
        async (response) => {
          console.log('Mueble registrado:', response);
          this.modalController.dismiss(formData);
          //Emitir evento de actualizacion
          const alert = this.alertController.create({
            header: 'Dar Alta',
            message: 'El bien mobiliario ha sido creado correctamente.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  window.location.reload(); // Recargar la página
                },
              },
            ],
          });
          (await alert).present();
        },
        (error) => {
          console.error('Error registrando el mueble:', error);
          this.showErrorAlert();
        }
      );
    }
  }

  /*Acciones Modal*/
  close() {
    this.modalController.dismiss();
  }
  /******************************************************/
  /*Ion Alerts*/
  async closeMuebleFormAlert() {
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
        'Ocurrió un error al registrar bienes muebles. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
