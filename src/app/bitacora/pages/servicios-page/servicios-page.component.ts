import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';

import { ServiciosPageService } from 'src/app/services/servicios-page/servicios-page.service';
import { TecnicosServiciosdataService } from 'src/app/services/tecnicos-serviciosdata/tecnicos-serviciosdata.service';

@Component({
  selector: 'app-servicios-page',
  templateUrl: './servicios-page.component.html',
  styleUrls: ['./servicios-page.component.scss'],
})
export class ServiciosPageComponent implements OnInit {
  serviciosForm!: FormGroup;
  servicioCreado: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private serviciosService: ServiciosPageService,
    private tecnicosservicioData: TecnicosServiciosdataService,
    private toastController: ToastController,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.serviciosForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      estimatedtime: [null, [Validators.required]],
    });
  }

  cancelar() {
    this.navController.back(); // Navegar hacia atrás en la pila de navegación
  }

  async registrarServicio() {
    if (this.serviciosForm.valid) {
      const name = this.name.value;
      const description = this.description.value;
      const estimatedtime = this.estimatedtime.value;

      this.serviciosService
        .registrarServicio({
          name: name,
          description: description,
          estimatedTime: estimatedtime,
        })
        .subscribe(
          async (response) => {
            console.log('Conexion exitosa', response);

            this.tecnicosservicioData.agregarServicio(name);

            await this.presentToast();

            this.serviciosForm.reset();
          },
          (error) => {
            console.error('Error al conectar', error);
          }
        );
    } else {
      console.error('El formulario no es valido');
    }
  }
  /*Toast*/
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'El servicio se ha creado exitosamente',
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  get name() {
    return this.serviciosForm.get('name')!;
  }
  get description() {
    return this.serviciosForm.get('description')!;
  }
  get estimatedtime() {
    return this.serviciosForm.get('estimatedtime')!;
  }
}
