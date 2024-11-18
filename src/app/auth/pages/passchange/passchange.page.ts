import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-passchange',
  templateUrl: './passchange.page.html',
  styleUrls: ['./passchange.page.scss'],
})
export class PasschangePage implements OnInit {
  passchangeForm!: FormGroup;
  resetToken: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private ActRoute: ActivatedRoute,
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Obtén el resetToken desde los parámetros de la URL
    this.resetToken = this.ActRoute.snapshot.queryParamMap.get('resetToken')!.toString();

    if (!this.resetToken) {
      // Maneja el caso donde no se proporciona un resetToken
      console.error('Token de restablecimiento no proporcionado.');
      this.router.navigate(['/error']); // Redirige a una página de error o muestra un mensaje apropiado
    }

    this.passchangeForm = this.formBuilder.group(
      {
        newpassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newpassword')!.value;
    const confirmPassword = formGroup.get('confirmPassword')!.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')!.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')!.setErrors(null);
    }
  }

  //Service
  async cambioPass() {
    const newpassword = this.newpassword.value;
    const confirmPassword = this.confirmPassword.value;

    if (newpassword === confirmPassword) {
      const url = 'https://api.bitacoraqa.navojoa.gob.mx/auth/reset-password';
      const body = { password: newpassword, resetToken: this.resetToken };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      try {
        const response = await this.http
          .post(url, body, {
            headers,
          })
          .toPromise();
        console.log(response);
      } catch (error) {
        console.error(error);
        const alert = await this.alertController.create({
          header: 'Error',
          message:
            'Hubo un problema al cambiar la contraseña. Por favor, inténtalo de nuevo.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      console.error('Las contraseñas no coinciden');
    }
  }

  get newpassword() {
    return this.passchangeForm.get('newpassword')!;
  }

  get confirmPassword() {
    return this.passchangeForm.get('confirmPassword')!;
  }

  async onSubmit() {
    if (this.passchangeForm.valid) {
      const alert = await this.alertController.create({
        header: 'Confirmar cambio',
        message:
          '¿Estás seguro de que quieres cambiar tu contraseña? No hay vuelta atrás.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            },
          },
          {
            text: 'Si, cambiar',
            handler: () => {
              console.log('Confirm Okay');
              this.cambioPass();
            },
          },
        ],
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Formulario inválido',
        message: 'Por favor, completa todos los campos correctamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
