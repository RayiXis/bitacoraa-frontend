import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components'; //Borrar despues
import { HttpClient } from '@angular/common/http';
import { TecnicosService } from 'src/app/services/tecnicos/tecnicos.service';
import { TecnicosServiciosdataService } from 'src/app/services/tecnicos-serviciosdata/tecnicos-serviciosdata.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-tecnicos',
  templateUrl: './modal-tecnicos.component.html',
  styleUrls: ['./modal-tecnicos.component.scss'],
})
export class ModalTecnicosComponent implements OnInit {
  @Input() tecnico: any;
  @Output() closeModalEvent = new EventEmitter<any>();

  tecnicos: any;
  tecnicosForm!: FormGroup;
  servicios: any[] = [];
  editMode: boolean = false;
  editIndex: number = -1;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private tecnicosService: TecnicosService,
    private tecnicosservicioData: TecnicosServiciosdataService
  ) {}

  /*Funcion para capitalizar primera letra*/
  capitalizeFirstLetter(value: string): string {
    return value
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  /*----------------------------------------------------------------*/
  ngOnInit() {
    this.getServicios();
    this.tecnicosForm = this.formBuilder.group(
      {
        code: ['', Validators.required],
        job: ['', Validators.required],
        password: [
          { value: '', disabled: !!this.tecnico },
          Validators.required,
        ],
        confirmpassword: [
          { value: '', disabled: !!this.tecnico },
          Validators.required,
        ],
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: [
          { value: '', disabled: !!this.tecnico },
          [Validators.required, Validators.email],
        ],
        phone: ['', Validators.required],
        services: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
    if (this.tecnico) {
      this.editMode = true;
      this.tecnicosForm.patchValue({
        name: this.tecnico.name,
        lastname: this.tecnico.lastname,
        code: this.tecnico.code,
        job: this.tecnico.job,
        email: this.tecnico.email,
        phone: this.tecnico.phone,
        services: this.tecnico.services,
      });
    }
  }
  /*---------------------------------------------------------------*/
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')!.value;
    const confirmPassword = formGroup.get('confirmpassword')!.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmpassword')!.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmpassword')!.setErrors(null);
    }
  }
  /*servicios de API*/
  getServicios() {
    this.http.get(`${environment.apiUrl}/services`).subscribe(
      (data: any) => {
        this.servicios = data;
      },
      (error) => {
        console.error('Error al obtener los servicios:', error);
      }
    );
  }
  getTecnicosFromAPI() {
    this.http.get<any[]>(`${environment.apiUrl}/users/technical`).subscribe(
      (data) => {
        console.log('Datos recibidos de la API:', data);
        this.tecnicos = data;
      },
      (error) => {
        console.error('Error al obtener los técnicos:', error);
      }
    );
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async onSubmit() {
    if (this.tecnicosForm.invalid) {
      this.alert(
        'Formulario Incompleto',
        'Por favor, complete todos los campos.'
      );
      return;
    }

    const tecnicoData = this.tecnicosForm.getRawValue();
    tecnicoData.name = this.capitalizeFirstLetter(tecnicoData.name);
    tecnicoData.lastname = this.capitalizeFirstLetter(tecnicoData.lastname);

    if (this.editMode) {
      try {
        await this.tecnicosService
          .updateTecnico(this.tecnico.userId, tecnicoData)
          .toPromise();
        this.alert('Editar Técnico', 'Técnico actualizado correctamente', [
          {
            text: 'Aceptar',
            role: 'confirm',
            handler: () => {
              window.location.reload();
            },
          },
        ]);
        this.closeModalEvent.emit({ action: 'update', tecnico: tecnicoData });
      } catch (error) {
        console.error('Error al actualizar técnico:', error);
      }
    } else {
      try {
        await this.tecnicosService
          .registrarTecnico(
            tecnicoData
          )
          .subscribe(
            (res) => {
              this.alert(
                'Crear nuevo técnico',
                'Técnico creado correctamente',
                [
                  {
                    text: 'Aceptar',
                    role: 'confirm',
                    handler: () => {
                      window.location.reload();
                    },
                  },
                ]
              );
            },
            (err) => {
              console.log(err);
            }
          );
      } catch (error) {
        console.error('Error al crear técnico:', error);
      }
    }
    this.dismissModal();
  }

  async cancel() {
    this.alert(
      'Confirmacion',
      'Al cancelar los cambios no serán guardados. ¿Deseas continuar?',
      [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Cerrar',
          handler: () => {
            this.tecnicosForm.reset();
            this.modalController.dismiss();
          },
        },
      ]
    );
  }

  async alert(header: string, message: string, buttons: any[] = ['Aceptar']) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: buttons,
    });
    await alert.present();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ModalTecnicosComponent,
      componentProps: { tecnico: null },
    });
    modal.onDidDismiss().then((OverlayEventDetail) => {
      const data = OverlayEventDetail.data;
      if (data === 'confirm') {
        // Aquí puedes hacer cualquier acción necesaria al confirmar el modal
      } else if (data === 'cancel') {
        // Aquí puedes hacer cualquier acción necesaria al cancelar el modal
      }
    });
    return await modal.present();
  }

  updateTecnico() {
    if (this.tecnicosForm.valid) {
      this.modalController.dismiss({
        action: 'update',
        tecnico: this.tecnicosForm.getRawValue(),
      });
    }
  }

  get name() {
    return this.tecnicosForm.get('name');
  }

  get lastname() {
    return this.tecnicosForm.get('lastname');
  }

  get code() {
    return this.tecnicosForm.get('code');
  }

  get job() {
    return this.tecnicosForm.get('job');
  }

  get phone() {
    return this.tecnicosForm.get('phone');
  }

  get email() {
    return this.tecnicosForm.get('email');
  }

  get password() {
    return this.tecnicosForm.get('password');
  }
  get confirmpassword() {
    return this.tecnicosForm.get('confirmpassword');
  }

  get services() {
    return this.tecnicosForm.get('services');
  }
}
