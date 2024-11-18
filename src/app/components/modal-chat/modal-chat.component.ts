import {
  Tickets,
  UserEmployee,
  UserTechnical,
} from 'src/app/bitacora/interfaces/Bitacora';
import { ChatService } from './../../bitacora/services/chat.service';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';

@Component({
  selector: 'modal-chat',
  templateUrl: './modal-chat.component.html',
  styleUrls: ['./modal-chat.component.scss'],
})
export class ModalChatComponent implements OnInit {
  public mensajes: any[] = [];
  public dataTicket!: Tickets;
  public newMessage: string = '';
  public tecnico!: UserTechnical;
  public empleado!: UserEmployee;
  public currentUser!: any;
  public user!: string;

  @Input() ticketId: string = '';
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(
    private bitacoraService: BitacoraService,
    private chatService: ChatService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTicketData();
    this.currentUserData();
  }

  currentUserData() {
    this.chatService.currentEmployee().subscribe((res) => {
      this.currentUser = res;
      console.log(res);
      if (this.currentUser.authId === this.dataTicket.technicalId) {
        this.user = 'tech';
      } else {
        this.user = 'user';
      }
    });
    console.log(this.user);
  }

  loadTicketData() {
    this.chatService.getTicketById(this.ticketId).subscribe(
      (ticket) => {
        this.dataTicket = ticket;

        if (ticket.status === 2) {
          this.toastMessage();
        }

        const technicalId = ticket.technicalId;
        const userId = ticket.userId;

        this.getEmployeeById(userId);
        this.getTechnicalId(technicalId);

        ticket.notes?.forEach((note) => {
          const formattedTime = new Date(note.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          this.mensajes.push({
            mensaje: note.note,
            hora: formattedTime,
            user: note.userId === technicalId ? 'tech' : 'user',
            date: new Date(note.date),
            senderId: note.userId,
          });
        });

        this.scrollToBottom();
      },
      (err) => {
        console.log('error: ', err);
      }
    );
  }

  getEmployeeById(id: string) {
    this.bitacoraService.getEmployeeById(id).subscribe((employee) => {
      this.empleado = employee;
    });
  }

  getTechnicalId(id: string) {
    this.bitacoraService.getTechnicalById(id).subscribe((tech) => {
      this.tecnico = tech;
    });
  }

  sendMessage() {
    const id = this.ticketId;
    const message = this.newMessage.toString();

    if (this.newMessage.trim()) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (this.currentUser.authId === this.dataTicket.technicalId) {
        this.user = 'tech';
      } else {
        this.user = 'user';
      }

      this.mensajes.push({
        mensaje: this.newMessage,
        hora: formattedTime,
        user: this.user,
        date: now,
        senderId: this.currentUser.authId,
        isLast: false,
      });

      this.chatService.sendMessage(id, message).subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );

      this.newMessage = '';

      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al desplazar el scroll al fondo:', err);
    }
  }

  isSameDay(fecha1: Date, fecha2: Date): boolean {
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  async toastMessage() {
    const toast = await this.toastController.create({
      message:
        'Este ticket ya se ha finalizado, no se puede enviar más mensajes. Chat solo lectura!',
      duration: 5000,
      position: 'bottom',
    });
    await toast.present();
  }
}
