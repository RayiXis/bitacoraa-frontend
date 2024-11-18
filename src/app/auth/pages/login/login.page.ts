import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public loginForm!: FormGroup;
  public showPassword: boolean = false;

  constructor(
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private location: Location,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get passwordType() {
    return this.showPassword ? 'text' : 'password';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  forgotPassword() {
    const webUrl = 'https://qa.oauth.navojoa.gob.mx/restore-password';
    window.open(webUrl, '_system');
  }
  //Servicio
  iniciarSesion() {
    const emailusuario = this.email.value;
    const contraseña = this.password.value;

    this.loginService.iniciarSesion(emailusuario, contraseña).subscribe(
      (respuesta) => {
        localStorage.setItem('token', respuesta.access_token);
        //TODO: Hacer que el router navigate mande a pages/inicio-page
        this.location.replaceState('/bitacora/inicio');
        window.location.reload();
        // this.router.navigate(['/bitacora/inicio']);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.showAlert(
            'Error de Conexión',
            'No se pudo conectar con el servidor. Por favor, inténtelo de nuevo más tarde.'
          );
        } else {
          this.showAlert(
            'Credenciales No Válidas',
            'Por favor validar bien la información proporcionada. Si aún no cuenta con un perfil solicite ayuda de un técnico'
          );
          console.log(error);
        }
      }
    );
  }
  //ION ALERT
  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            // this.loginForm.reset();
          },
        },
      ],
    });
    await alert.present();
  }

  //Errores del formulario
  mostrarErrorAPI(mensaje: string) {}
  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    //console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    } else {
    }
  }
}
