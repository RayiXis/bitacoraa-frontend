import { Component, Input, OnInit } from '@angular/core';
import {
  ModalController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import {
  Tickets,
  UserEmployee,
  UserTechnical,
} from 'src/app/bitacora/interfaces/Bitacora';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { environment } from 'src/environments/environment';
import { ModalChatComponent } from '../modal-chat/modal-chat.component';

@Component({
  selector: 'modal-ticket',
  templateUrl: './modal-modificar-ticket.component.html',
  styleUrls: ['./modal-modificar-ticket.component.scss'],
})
export class ModalModificarTicketComponent implements OnInit {
  public tickets: Tickets[] = [];
  public assignedTechnical: string = 'Sin Asignar';
  public technicalProfile: UserTechnical | UserEmployee | null = null;
  public idTechnical: string = '';
  public AllTechs: UserTechnical[] = [];
  public userEmployee: { [key: string]: UserEmployee | UserTechnical } = {};
  public isLoading: boolean = true;
  public btnDisabled: boolean = true;
  public selectedTechnicalId: string = '';
  public bitacoraApi = environment.apiUrl;

  @Input() ticketId: string = '';

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private bitacoraServices: BitacoraService
  ) {}

  ngOnInit() {
    // this.getCurrentTech();
    this.bitacoraServices.getUserProfile().subscribe( tech => {
      this.idTechnical = tech.authId;
      this.getTechs();
      this.getTicket(this.ticketId);
    })
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getTicket(id: string) {
    this.isLoading = true;
    this.bitacoraServices.getTicketById(id).subscribe(
      (ticket) => {
        this.tickets = [ticket];
        this.getUserById(ticket.userId);
        this.getTechnById(ticket.technicalId);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener el ticket:', error);
        this.isLoading = false;
      }
    );
  }

  getUserById(id: string) {
    this.bitacoraServices.getEmployeeById(id).subscribe((userEmployee) => {
      this.userEmployee[id] = userEmployee;
    });
  }

  getTechnById(id: string | undefined) {
    if (id) {
      this.bitacoraServices.getTechnicalById(id).subscribe((userTech) => {
        const fullName = `${userTech.name} ${userTech.lastname}`;
        this.assignedTechnical = fullName;
      });
    } else {
      this.assignedTechnical = 'Sin Asignar';
    }
  }

  getTechs() {
    this.bitacoraServices.getAllTechnicals().subscribe( techs => {
      this.AllTechs = techs.filter( technical => technical.authId !== this.idTechnical );
    });
  }

  // getCurrentTech() {
  //   this.bitacoraServices.currentUser().subscribe((tech) => {
  //     this.technicalProfile = tech;
  //   });
  // }

  onTechSelect(event: any) {
    this.selectedTechnicalId = event.detail.value;
    this.btnDisabled = false;
  }

  assignedIssue() {
    const idAssigned = this.ticketId;

    if (this.selectedTechnicalId === '') {
      console.log('sin cambios');
      return;
    }

    const selectedTech = this.AllTechs.find(
      (tech) => tech.authId === this.selectedTechnicalId
    );

    const note =
      'Este es un mensaje automatizado, solamente para informar que ya se está trabajando en su ticket';

    this.bitacoraServices
      .assignedIssue(note, this.ticketId, this.selectedTechnicalId)
      .subscribe(
        (resp) => {
          this.taskAlert(idAssigned, 1);
          this.modalController.dismiss();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  autoAsignar() {
    const id = this.ticketId;
    this.bitacoraServices
      .autoAssignIssue(this.ticketId, 'n/a', 'n/a')
      .subscribe(
        (res) => {
          this.taskAlert(id, 2);
          this.modalController.dismiss();
        },
        (err) => {
          console.log('errors:', err);
        }
      );
  }

  async OpenModalChat(id: string) {
    const modal = await this.modalController.create({
      component: ModalChatComponent,
      componentProps: { ticketId: id },
    });

    await modal.present();
    const { role } = await modal.onDidDismiss();

    if (role === 'backdrop' || role === 'close' || role === 'cancel') {
      location.reload();
    }
  }

  async taskAlert(id: string, option: number) {
    const alert = await this.alertController.create({
      header: 'Asignación de ticket',
      subHeader: 'El ticket se ah asignado correctamente',
      buttons: [
        {
          text: 'Aceptar',
          handler: async () => {
            if(option === 2){
              this.toastMessage('Por favor, envía un mensaje al usuario para informarle que su problema está siendo atendido.', 5000)
              return await this.OpenModalChat(id);
            }
            if(option === 1){
              this.toastMessage('Se ha envíado un mensaje automatizado al usuario informandole que su ticket ha sido atendido', 5000);
            }
            this.modalController.dismiss();
          },
        },
      ],
    });
    await alert.present();
  }

  async toastMessage( message: string, duration: number ) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom',
    });
    return await toast.present();
  }

}
