import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { CatalogosService } from 'src/app/services/catalogos/catalogos.service';
import { environment } from 'src/environments/environment';
import { PerifericosComponent } from '../perifericos/perifericos.component';
import { BitacoraService } from '../../bitacora/services/bitacora.service';
import { Equipos } from 'src/app/bitacora/interfaces/Equipos';

@Component({
  selector: 'app-modal-equipo',
  templateUrl: './modal-equipo.component.html',
  styleUrls: ['./modal-equipo.component.scss'],
})
export class ModalEquipoComponent implements OnInit {
  @Input() equipment: any;
  public equipo!: Equipos;
  modalequipoForm: FormGroup;

  public txtDefault: any = 'Cargar Imágen';
  private imageNames: string[] = [];

  public bitacoraApi = environment.apiUrl;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private catalogoService: CatalogosService,
    private bitacoraService: BitacoraService
  ) {
    this.modalequipoForm = this.formBuilder.group({
      sindicatura_Inventory_Code: [''],
      photos: [[], Validators.required],
      assigned_ip: [
        '',
        [
          Validators.minLength(8),
          Validators.pattern(/^(\d{1,3}\.){3}\d{1,3}$/),
        ],
      ],
      type: [''],
      description: ['', Validators.required],
      directionEthernet: ['', [Validators.minLength(8)]],
      hdd: [''],
    });
  }

  inputImage() {
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }

    // this.fileInput.nativeElement.click();
    // const fileInputElement = this.fileInput.nativeElement;

    this.fileInput.nativeElement.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        this.imageNames = files.map((file) => file.name); // Almacenar nombres de todas las imágenes
        if (files.length === 1) {
          this.txtDefault = files[0].name;
        } else if (files.length > 1) {
          this.txtDefault = this.imageNames.join(', '); // agreagr una coma al final del nombre de cada img si son más de una
        }
      }
    });
  }

  ngOnInit() {
    if (this.equipment) {
      this.modalequipoForm.patchValue({
        sindicatura_Inventory_Code: this.equipment.sindicatura_Inventory_Code,
        assigned_ip: this.equipment.assigned_ip,
        type: this.equipment.type,
        description: this.equipment.description,
        directionEthernet: this.equipment.directionEthernet,
        hdd: this.equipment.hdd,
      });

      if (this.equipment.photos && this.equipment.photos.length > 0) {
        this.imageNames = this.equipment.photos;
        this.txtDefault = this.imageNames.join(', ');
        // Remove the 'required' validator if there are already photos
        this.modalequipoForm.get('photos')?.clearValidators();
        this.modalequipoForm.get('photos')?.updateValueAndValidity();
      } else {
        // Add the 'required' validator if there are no photos
        this.modalequipoForm.get('photos')?.setValidators(Validators.required);
        this.modalequipoForm.get('photos')?.updateValueAndValidity();
      }
    }
  }

  async openPerifericosModal() {
    const modal = await this.modalController.create({
      component: PerifericosComponent,
      componentProps: {
        // Puedes pasar datos iniciales si es necesario
      },
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Aquí puedes manejar la respuesta del modal si es necesario
      console.log('Datos del periférico:', data);
    }
  }

  /*METODO PARA LLAMAR API*/
  private loadEquipment() {
    this.catalogoService.getEquipment().subscribe(
      (data) => {
        this.equipment = data;
      },
      (error) => {
        console.error('Error al obtener equipos', error);
      }
    );
  }

  submit() {
    if (this.modalequipoForm.invalid) {
      console.log('Formulario inválido');
      return;
    }

    // const fileInput = document.querySelector<HTMLInputElement>('#file');

    const formData = new FormData();
    const formValues = this.modalequipoForm.value;

    // Añadir los campos básicos
    formData.append(
      'sindicatura_Inventory_Code',
      formValues.sindicatura_Inventory_Code
    );
    formData.append('assigned_ip', formValues.assigned_ip);
    formData.append('type', formValues.type);
    formData.append('description', formValues.description);
    formData.append('directionEthernet', formValues.directionEthernet);
    formData.append('hdd', formValues.hdd);
    // formData.append('telephoneIP', formValues.telephoneIP);
    // formData.append('print', formValues.print);
    // formData.append('noBreak', formValues.noBreak);

    //Añadir los archivos de photos como un arreglo
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    }

    formData.forEach((value, key) => {
      // console.log(`${key}: ${value}`);
    });

    if (this.equipment) {
      this.catalogoService
        .updateEquipment(this.equipment._id, formData)
        .subscribe({
          next: (response) => {
            console.log('Equipo actualizado', response);
            this.showSuccessAlertAndDismiss();
          },
          error: (error) => {
            console.error('Error al actualizar el equipo', error);
            this.showErrorAlert();
          },
        });
    } else {
      this.catalogoService.darAltaEquipo(formData).subscribe({
        next: (response) => {
          console.log(response);
          this.showSuccessAlertAndDismiss();
        },
        error: (error) => {
          console.error('Error al registrar el equipo', error);
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

  /*ION-ALERT*/
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
  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message:
        'Ocurrió un error al registrar el equipo. Por favor, inténtelo de nuevo.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  /* ION-ALERT */
  async showSuccessAlertAndDismiss() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El equipo se ha guardado correctamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.modalController.dismiss();
          },
        },
      ],
    });

    await alert.present();
  }
  /*-------------------------------------------------------------------------------------*/
}
