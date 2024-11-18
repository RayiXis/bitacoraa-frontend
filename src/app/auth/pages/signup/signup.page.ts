import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { IonModal, ModalController, AlertController } from '@ionic/angular';
import { jwtDecode } from 'jwt-decode';
import { OverlayEventDetail } from '@ionic/core/components';
import { Router, ActivatedRoute } from '@angular/router';

import { Dependencia, Direccion } from '../../interfaces/auth';
import { ModalEquipoComponent } from '../../../components/modal-equipo/modal-equipo.component';
import { SignupService } from '../../../services/signup/signup.service';
import { CreateEmployee } from '../../interfaces/CreateEmployee';
import { PaginationResponse } from 'src/app/bitacora/interfaces/Bitacora';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public signupForm!: FormGroup;
  public isDependenciaSelected: boolean = false;
  public dependencias: Dependencia[] = [];
  public direcciones: Direccion[] = [];
  public device: boolean = false;
  public emailFromToken: string = '';
  public selectedDependencia: any;
  public selectedDireccion: any;
  public filteredDependencias: Dependencia[] = [];
  public filteredDirecciones: Direccion[] = [];
  public token: string = '';
  private dependenceToApi!: string;
  private directionToApi!: string;

  constructor(
    private ActRoute: ActivatedRoute,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private router: Router,
    private signupService: SignupService,
    public formsModule: FormsModule,
    public modalController: ModalController,
  ) {}

  ngOnInit() {
    this.loadDependencias()
    this.signupForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        phone: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
            Validators.pattern('^[0-9]+$')
          ],
        ],
        job: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d!@#$%^&*()_+{}\\[\\]:;<>,.?~\\/\\-]{6,}$'),
          ]
        ],
        confirmpassword: ['', Validators.required],
        canRequestDevices: [false, Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );

    // Get token from URL
    this.ActRoute.queryParams.subscribe((params) => {
      const token = params['token'];
      this.token = params['token'];
      this.token = this.token.replace('token=', '');
      console.log(this.token);
      if (token) {
        const decodedToken: any = jwtDecode(token);
        this.emailFromToken = decodedToken.email; // Set the emailFromToken
        this.signupForm.patchValue({ email: this.emailFromToken });
      }
    });
  }

  changeDevice(deviceRadio: string) {
    if (deviceRadio === 'true') {
      this.device = true;
      //this.sendDeviceToApi();
    } else {
      this.device = false;
    }
    this.signupForm.controls['canRequestDevices'].setValue(this.device);
  }

  onDependenciaChange(event: any) {
    // console.log('Dependencia cambiada:', event.detail.value);
    const dependencia = event.detail.value;
    this.isDependenciaSelected = !!dependencia;
    if (this.isDependenciaSelected) {
      this.loadDirecciones(dependencia); // Cargar direcciones basadas en la dependencia seleccionada
    } else {
      this.direcciones = [];
      this.signupForm.get('direccion')?.setValue('');
    }
  }

  @ViewChild(IonModal) modal!: IonModal;

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
  }

  async openModalEquipo() {
    const modal = await this.modalController.create({
      component: ModalEquipoComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  loadDependencias() {
    this.signupService.getDependencias().subscribe(
      data => {
        const dependencias = data.data.filter(
          (dependencias: any) => dependencias.state
        );
        this.dependencias = dependencias;
        this.filteredDependencias = dependencias;

      },
      (error) => {
        console.error('Error al obtener dependencias:', error);
      }
    );
  }

  loadDirecciones(dependencyCode: string) {
    this.signupService.getDirecciones(dependencyCode).subscribe(
      data => {
        const direcciones = data.data.filter(
          (direccion) =>
            direccion.state
        );
        this.direcciones = direcciones;
        this.filteredDirecciones = direcciones;
      },
      (error) => {
        console.error('Error al obtener direcciones:', error);
      }
    );
  }

  filterDependencias(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDependencias = this.dependencias.filter(dependencia =>
      dependencia.name.toLowerCase().includes(searchTerm)
    );
  }
  filterDirecciones(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDirecciones = this.direcciones.filter(direccion =>
      direccion.name.toLowerCase().includes(searchTerm)
    );
  }

  selectDependencia(dependencia: Dependencia) {
    this.selectedDireccion = 'Seleccionar dirección'
    this.selectedDependencia = dependencia;
    this.isDependenciaSelected = true;
    this.dependenceToApi = dependencia.code;
    this.loadDirecciones(dependencia.code)
    this.modal.dismiss();
  }

  selectDireccion(direccion: Direccion) {
    this.selectedDireccion = direccion;
    this.directionToApi = direccion.code;
    this.modal.dismiss();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')!.value;
    const confirmPassword = formGroup.get('confirmpassword')!.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmpassword')!.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmpassword')!.setErrors(null);
    }
  }

  //Servicio
  onSubmit() {

    const code = `${this.directionToApi}`
    const name = this.signupForm.get('name')?.value;
    const lastname = this.signupForm.get('lastname')?.value;
    const phone = this.signupForm.get('phone')?.value;
    const job = this.signupForm.get('job')?.value;
    const email = this.signupForm.get('email')?.value;
    const password = this.signupForm.get('password')?.value;
    const confirmpassword = this.signupForm.get('confirmpassword')?.value;
    const dependence = document.getElementById('modalDependencia')?.textContent?.trim()!;
    const direction = document.getElementById('modalDireccion')?.textContent?.trim()!;
    const token = this.token;

    const dataUser: CreateEmployee = { code, password, name, lastname, email, phone, job, token };

    if(!this.signupForm.valid) {
      if( !(password === confirmpassword) ) {
        this.alert('Confirmación de contraseña', 'Las contraseñas no coinciden')
        return
      }
      this.alert('Registro de nuevo usuario', 'Proporcionar toda la información solicitada.')
      return;
    }

    if(dependence === 'Seleccionar dependencia' || direction === 'Seleccionar dirección') {
      this.alert('Registrar nuevo usuario', 'Seleccionar dependencia y dirección')
      return;
    }

    this.signupService
      .registrarUsuario(dataUser)
      .subscribe(
        (response) => {
          console.log('registro existoso', response);
          this.alert('REGISTRAR USUARIO', 'Usuario creado correctamente. Inicia sesión para comenzar a usar nuestra aplicación.', [
            {
              text: 'Aceptar',
              role: 'confirm',
              handler: () => {
                this.router.navigate(['/auth']);
              }
            }
          ])
        },
        (error) => {
          this.alert('REGISTRAR USUARIO', error.error.message || 'Ya hay un registro con ese correo');
        }
      );
  }

  async alert( header: string, message: string, btns: any[] = ['Aceptar']) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: btns
    });
    await alert.present();
  }

  //Errores de formulario
  mostrarErrorAPI(mensaje: string) {}
  get name() {
    return this.signupForm.get('name')!;
  }
  get lastname() {
    return this.signupForm.get('lastname')!;
  }
  get phone() {
    return this.signupForm.get('phone')!;
  }
  get job() {
    return this.signupForm.get('job');
  }
  get email() {
    return this.signupForm.get('email')!;
  }
  get password() {
    return this.signupForm.get('password')!;
  }
  get confirmpassword() {
    return this.signupForm.get('confirmpassword');
  }

}
