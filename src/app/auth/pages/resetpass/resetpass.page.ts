import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ResetpassService } from 'src/app/services/resetpass/resetpass.service';
import { HttpClient } from '@angular/common/http';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-resetpass',
  templateUrl: './resetpass.page.html',
  styleUrls: ['./resetpass.page.scss'],
})
export class ResetpassPage implements OnInit {
  emailPass: string = '';

  resetpassFormSlide1!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private resetpassService: ResetpassService,
    private toastController: ToastController,
    private navController: NavController
  ) {}
  /*
  onUsernameSubmit() {
    this.resetpassService
      .sendUsername(this.usernameReset)
      .subscribe((Response) => {
        this.goNext();
      });
  }
  onEmailSubmit() {
    this.resetpassService.sendEmail(this.emailPass).subscribe((Response) => {
      this.goNext();
    });
  }
  onCodesubmit() {
    this.resetpassService.sendCode(this.code).subscribe((Response) => {});
  }
*/
  /*-----------------------------------------------------------------*/
  ngOnInit() {
    this.resetpassFormSlide1 = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  cancelar() {
    this.navController.back(); // Navegar hacia atrás en la pila de navegación
  }
  //Errores del formulario
  get email() {
    return this.resetpassFormSlide1.get('email')!;
  }

  onSubmit() {
    if (this.resetpassFormSlide1.valid) {
      const email = this.resetpassFormSlide1.value.email;

      this.resetpassService.sendResetPasswordRequest(email).subscribe(
        (response) => {
          console.log('Solicitud de cambio de contraseña enviado con exito');
        },
        (error) => {
          console.error(
            'Error al enviar solicitud de cambio de contraseña',
            error
          );
        }
      );

      // this.resetpassService.checkEmailExistence(email).subscribe(
      //   (response: any) => {
      //     if (response.exists) {
      //       this.sendResetPasswordRequest(email);
      //     } else {
      //       console.log('El correo electrónico no existe en la base de datos.');
      //     }
      //   },
      //   (error) => {
      //     console.error(
      //       'Error al verificar la existencia del correo electrónico',
      //       error
      //     );
      //   }
      // );
    }
  }
  //Toast
  async presentToast() {
    const toast = await this.toastController.create({
      message:
        'Por favor, cheque su correo electrónico para acceder al enlace de cambio de contraseña. Si no lo encuentra en su bandeja de entrada, asegúrese de revisar también la carpeta de correo no deseado o spam. ¡Gracias!',
      duration: 12000,
    });
    toast.present();
  }

  sendResetPasswordRequest(email: string) {
    this.resetpassService.sendResetPasswordRequest(email).subscribe(
      (response) => {
        console.log('Solicitud de cambio de contraseña enviado con exito');
      },
      (error) => {
        console.error(
          'Error al enviar solicitud de cambio de contraseña',
          error
        );
      }
    );
  }
}
