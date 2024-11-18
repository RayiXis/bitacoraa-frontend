import { Component, OnInit, ElementRef, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-inmuebles',
  templateUrl: './modal-inmuebles.component.html',
  styleUrls: ['./modal-inmuebles.component.scss'],
})
export class ModalInmueblesComponent implements OnInit {
  @Input() inmueble: any;
  inmuebleForm: FormGroup;
  public sindicaturaApi = environment.apiUrl;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('pdfInput') pdfInput!: ElementRef;
  public txtDefault: any = 'Cargar Imágen';
  public txtPdfDefault: string = 'Cargar PDF';
  private imageNames: string[] = [];
  private pdfNames: string[] = [];

  public progress: number = 0;
  public isProgressVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private sindicaturaService: SindicaturaService
  ) {
    this.inmuebleForm = this.formBuilder.group({
      folio: [''],
      description: [''],
      type: [''],
      location: [''],
      cadastralKey: [''],
      status: [''],
      cadastralValue: [''],
      bookValue: [''],
      photos: [[]],
      pdfs: [[]],
      pubPropReg: [''],
      lastAppraisalDate: [''],
      land: [''],
      construction: [''],
    });
  }

  ngOnInit() {
    if (this.inmueble) {
      // Asigna los valores a través de patchValue
      this.inmuebleForm.patchValue({
        folio: this.inmueble.folio || '',
        description: this.inmueble.description || '',
        type: this.inmueble.type || '',
        location: this.inmueble.location || '',
        cadastralKey: this.inmueble.cadastralKey || '',
        status: this.inmueble.status || '',
        cadastralValue: this.inmueble.cadastralValue || '',
        bookValue: this.inmueble.bookValue || '',
        pubPropReg: this.inmueble.pubPropReg || '',
        lastAppraisalDate: new Date(this.inmueble.lastAppraisalDate) || '',
        land: this.inmueble.surface?.land || '', // Verificación
        construction: this.inmueble.surface?.construction || '', // Verificación
      });

      // Manejo de imágenes y PDFs
      if (this.inmueble.photos) {
        this.imageNames = this.inmueble.photos;
        this.txtDefault = this.imageNames.join(', ');
      }
      if (this.inmueble.pdfs) {
        this.pdfNames = this.inmueble.pdfs;
        this.txtPdfDefault = this.pdfNames.join(', ');
      }
    }
  }

  inputImage(event: MouseEvent) {
    event.stopPropagation();
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }
    this.fileInput.nativeElement.click();
  }

  inputPdf(event: MouseEvent) {
    event.stopPropagation();
    if (!this.pdfInput) {
      console.error('Elemento pdfInput no está definido.');
      return;
    }
    this.pdfInput.nativeElement.click();
  }

  onFileChange(event: Event, fileType: 'photos' | 'pdfs') {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      if (fileType === 'photos') {
        this.inmuebleForm.patchValue({ photos: files }); // Guardar archivos completos
        this.txtDefault = files.map((file) => file.name).join(', ');
        console.log('Archivos de fotos seleccionados:', files);
      } else if (fileType === 'pdfs') {
        this.inmuebleForm.patchValue({ pdfs: files }); // Guardar archivos completos
        this.txtPdfDefault = files.map((file) => file.name).join(', ');
        console.log('Archivos de PDF seleccionados:', files);
      }
    }
  }

  submit() {
    this.isProgressVisible = true;
    const formData = new FormData();
    const formValues = this.inmuebleForm.value;

    formData.append('folio', formValues.folio);
    formData.append('description', formValues.description);
    formData.append('type', formValues.type);
    formData.append('location', formValues.location);
    formData.append('cadastralKey', formValues.cadastralKey);
    formData.append('status', formValues.status);
    formData.append('cadastralValue', formValues.cadastralValue);
    formData.append('bookValue', formValues.bookValue);
    formData.append('pubPropReg', formValues.pubPropReg);
    formData.append('lastAppraisalDate', formValues.lastAppraisalDate);
    formData.append('land', formValues.land);
    formData.append('construction', formValues.construction);

    // Agregar fotos nuevas si están presentes, si no, conservar las existentes
    const fileInput = this.fileInput.nativeElement;
    if (fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
      }
    } else if (this.inmueble.photos && this.inmueble.photos.length > 0) {
      this.inmueble.photos.forEach((photo: string) => {
        formData.append('photos', photo);
      });
    }

    // Agregar PDFs nuevos si están presentes, si no, conservar los existentes
    const pdfInput = this.pdfInput.nativeElement;
    if (pdfInput.files && pdfInput.files.length > 0) {
      for (let i = 0; i < pdfInput.files.length; i++) {
        formData.append('pdfs', pdfInput.files[i]);
      }
    } else if (this.inmueble.pdfs && this.inmueble.pdfs.length > 0) {
      this.inmueble.pdfs.forEach((pdf: string) => {
        formData.append('pdfs', pdf);
      });
    }

    const interval = setInterval(() => {
      if (this.progress < 0.9) {
        this.progress += 0.1;
      } else {
        clearInterval(interval);
      }
    }, 500);

    if (this.inmueble) {
      console.log('Actualizando inmueble con id:', this.inmueble._id);
      this.sindicaturaService
        .updateInmueble(this.inmueble._id, formData)
        .subscribe(
          async (response) => {
            this.progress = 1;
            clearInterval(interval);
            setTimeout(() => {
              this.isProgressVisible = false;
              this.progress = 0;
            }, 500);
            console.log('Propiedad actualizada');
            this.modalController.dismiss(formData);
            const alert = await this.alertController.create({
              header: 'Actualización',
              message: 'La propiedad ha sido actualizada correctamente.',
              buttons: [
                { text: 'Aceptar', handler: () => window.location.reload() },
              ],
            });
            await alert.present();
          },
          (error) => {
            clearInterval(interval);
            this.progress = 0;
            console.error('Error al actualizar la propiedad:', error);
            this.showErrorAlert();
          }
        );
    } else {
      this.sindicaturaService.darAltaInmueble(formData).subscribe(
        async (response) => {
          this.progress = 1;
          clearInterval(interval);
          setTimeout(() => {
            this.isProgressVisible = false;
            this.progress = 0;
          }, 500);
          console.log('Propiedad registrada:', response);
          this.modalController.dismiss(formData);
          const alert = await this.alertController.create({
            header: 'Dar Alta',
            message: 'La propiedad ha sido creada correctamente.',
            buttons: [
              { text: 'Aceptar', handler: () => window.location.reload() },
            ],
          });
          await alert.present();
        },
        (error) => {
          clearInterval(interval);
          this.progress = 0;
          console.error('Error al actualizar la propiedad:', error);
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
  async closeInmuebleFormAlert() {
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
        'Ocurrió un error al registrar biene inmueble. Por favor, inténtelo de nuevo.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.modalController.dismiss();
            this.isProgressVisible = false;
          },
        },
      ],
    });

    await alert.present();
  }
}
