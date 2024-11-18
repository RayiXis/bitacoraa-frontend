import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { InviteEmailService } from 'src/app/services/invite-email/invite-email.service';

@Component({
  selector: 'app-invite-page',
  templateUrl: './invite-page.component.html',
  styleUrls: ['./invite-page.component.scss'],
})
export class InvitePageComponent implements OnInit {
  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private inviteEmailService: InviteEmailService
  ) {}

  emails: string[] = [];
  addEmail: string = '';

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 8000,
      position: 'middle',
    });
    toast.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmar envío',
      message:
        '¿Estás seguro de querer enviar la invitación a los correos seleccionados?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Si',
          handler: () => {
            console.log('Confirm Okay');
            this.enviarCorreo();
          },
        },
      ],
    });
    await alert.present();
  }

  agregarCorreo() {
    if (
      this.addEmail.trim() !== '' &&
      !this.emails.includes(this.addEmail.trim())
    ) {
      this.emails.push(this.addEmail.trim());
      this.addEmail = '';
    } else {
      this.presentToast('El correo electronico ya esta en la lista');
    }
  }

  eliminarCorreo(index: number) {
    this.emails.splice(index, 1);
  }

  async confirmInvites() {
    if (this.emails.length > 0) {
      await this.presentAlertConfirm();
    } else {
      this.presentToast(
        'Debes agregar al menos un correo electrónico para enviar la invitación'
      );
      console.log('No hay correo para enviar');
    }
  }

  enviarCorreo() {
    this.inviteEmailService.enviarCorreo(this.emails).subscribe(
      (response) => {
        console.log('Invitación enviada con éxito', response);
        if (response && response.message) {
          // Construir mensaje personalizado
          const existingEmails = response.message;
          this.presentToast(existingEmails);
        } else {
          this.presentToast('Invitación(es) enviada(s) exitosamente');
        }
        // Limpiar la lista de correos
        this.emails = [];
      },
      (error) => {
        console.error('Error al enviar invitación(es)', error);
        if (error.error && error.error.message) {
          const existingEmails = error.error.message.split(': ')[1];
          const customMessage = `El/Los correo(s) ${existingEmails} ya existe(n) en la base de datos`;
          this.presentToast(customMessage);
        } else {
          this.presentToast('Error al enviar la invitación');
        }
      }
    );
  }

  ngOnInit() {}
}
