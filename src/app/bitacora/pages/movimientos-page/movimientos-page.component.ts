import { Component, OnInit, Input } from '@angular/core';
import { ModalController, PickerController } from '@ionic/angular';

import { Agenda } from '../../interfaces/Accesories';
import { BitacoraService } from '../../services/bitacora.service';
import { ChatService } from '../../services/chat.service';
import { ModalChatComponent, ModalLevantarTicketComponent, ModalSolicitarEquipoComponent } from 'src/app/components';
import { Tickets } from '../../interfaces/Bitacora';
import { Altas, Bajas, Pdfs } from '../../interfaces/pdfs.';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-movimientos-page',
  templateUrl: './movimientos-page.component.html',
  styleUrls: ['./movimientos-page.component.scss'],
})
export class MovimientosPageComponent implements OnInit {

  public selectedSegment: 'tickets' | 'solicitudes' | 'pdfs' = 'tickets';
  public user: any;
  public canRequestDevices: boolean = false;
  public tickets: Tickets[] = [];
  public filteredTickets: Tickets[] = [];
  public agenda: Agenda[] = [];
  public filteredAgenda: Agenda[] = [];
  public pdfs: any[] = [];
  public filteredPdfs: any[] = [];
  public isLoading: boolean = true;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public dateSelect: boolean = false;
  public dateStar: string = 'Fecha Inicio';
  public dateEnd: string = 'Fecha Fin';
  public notTickets: boolean = false;
  public notSolicitudes: boolean = false;
  public notPdfs: boolean = false;
  public isModalOpen = false;
  public selectToUpdate: any;
  public valorSeleccionado: boolean = false;
  public defaultValue: string = 'altas';
  public customAlertOptions = {
    header: 'Acciones de Equipo',
    subHeader: 'Selecciona uno para filtrar',
    translucent: true,
  };

  constructor(
    private chatService: ChatService,
    private bitacoraService: BitacoraService,
    private pickerController: PickerController,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.currentUser();
  }

  changeSelectedFilter(event: CustomEvent) {
    this.defaultValue = event.detail.value;
    this.getPdfsByUser(this.user.authId)
  }

  segmentChanged(event: any): void {
    this.selectedSegment = event.detail.value as
      | 'tickets'
      | 'solicitudes'
      | 'pdfs';
  }

  async levantarTicketModal() {
    const modal = await this.modalController.create({
      component: ModalLevantarTicketComponent,
    })

    await modal.present();
    await modal.onDidDismiss();

    this.getTicketByUser( this.user.authId );
  }

  searchInput(event: any) {
    const query = event.target.value.toLowerCase();

    if(this.selectedSegment === 'tickets') {
      this.filterSearchBar(query);
    }

    if(this.selectedSegment === 'solicitudes') {
      this.filterSearchBar(query);
    }

    if(this.selectedSegment === 'pdfs') {
      this.filterSearchBar(query);
    }
  }

  filterSearchBar(query: string) {

    if(this.selectedSegment === 'tickets') {
      this.filteredTickets = this.tickets.filter((ticket) => {
        return ticket.reportDetail.toLowerCase().includes(query);
      });
      this.notTickets = this.filteredTickets.length === 0;
    }

    if(this.selectedSegment === 'solicitudes') {
      this.filteredAgenda = this.agenda.filter( agenda => {
        return agenda.place.toLocaleLowerCase().includes(query);
      })
      this.notSolicitudes = this.filteredAgenda.length === 0;
    }

    if(this.selectedSegment === 'pdfs') {
      this.filteredPdfs = this.pdfs.filter( pdf => {
        return pdf.freeText.toLocaleLowerCase().includes(query);
      })
      this.notPdfs = this.filteredPdfs.length === 0;
    }

  }

  currentUser() {
    this.chatService.currentEmployee().subscribe(
      (res) => {
        this.user = res;
        const idUser = res.authId;
        this.canRequestDevices = res.canRequestDevices;
        this.getTicketByUser(idUser);
        this.getAgendaByUser(idUser);
        this.getPdfsByUser(idUser);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getTicketByUser(id: string) {
    this.chatService.getTicketByUser(id).subscribe(
      (tickets) => {
        this.tickets = tickets;
        this.filteredTickets = this.tickets;
        this.isLoading = false;
        // const userIds = [
        //   ...new Set(this.tickets.map((ticket) => ticket.userId)),
        // ];
        // console.log(userIds);
        // const techIds = [
        //   ...new Set(
        //     this.tickets
        //       .map((ticket) => ticket.technicalId)
        //       .filter((id) => id !== undefined)
        //   ),
        // ];

        // techIds.forEach((techId) => {
        //   this.getTechnById(techId);
        // });

        // this.tickets.forEach((ticket) => {
        //   if (!ticket.technicalId) {
        //     ticket.tech = 'Sin Asignar';
        //   }
        // });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAgendaByUser( id: string ) {
    this.bitacoraService.getAgendaByUser( id, 1, 1000, '', '', true ).subscribe( requests => {
      this.agenda = requests.data;
      this.filteredAgenda = this.agenda;
    })
  }

  getPdfsByUser( id: string ) {
    this.bitacoraService.getPdfsByUser(id, this.defaultValue).subscribe( res => {
      this.pdfs = res;
      this.filteredPdfs = this.pdfs;
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

  showPdf( nombrePdf: string, folder: string ) {
    const baseUrl = environment.apiUrl;
    const url = `${baseUrl}/documents/${folder}/${nombrePdf}.pdf`;
    window.open(url, '_blank');
  }

  async modalRequestEquipment( request?: any) {
    const modal = await this.modalController.create({
      component: ModalSolicitarEquipoComponent,
      componentProps: {
        requestSoli: request,
      },
    });
    await modal.present();

    await modal.onDidDismiss();

    this.getAgendaByUser(this.user.authId)

  }

  async chatModal(ticket: Tickets) {
    const modal = await this.modalController.create({
      component: ModalChatComponent,
      componentProps: { ticketId: ticket._id },
    });
    return await modal.present();
  }

  hasNotes(ticket: any): boolean {
    return ticket && Array.isArray(ticket.notes) && ticket.notes.length > 0;
  }

  // getTechnById(id: string) {
  //   console.log(id);
  //   this.bitacoraService.getTechnicalById(id).subscribe((userTech) => {
  //     const fullName = `${userTech.name} ${userTech.lastname}`;

  //     this.tickets.forEach((ticket) => {
  //       if (ticket.technicalId === id) {
  //         ticket.assignedTechnical = fullName;
  //       }
  //     });

  //     this.filteredTickets = [...this.tickets];
  //   });
  // }

  async openDatePicker(isStartDate: boolean) {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const days = Array.from({ length: 31 }, (_, i) => ({
      text: (i + 1).toString(),
      value: (i + 1).toString(),
    }));
    const months = [
      { text: 'Enero', value: '1' },
      { text: 'Febrero', value: '2' },
      { text: 'Marzo', value: '3' },
      { text: 'Abril', value: '4' },
      { text: 'Mayo', value: '5' },
      { text: 'Junio', value: '6' },
      { text: 'Julio', value: '7' },
      { text: 'Agosto', value: '8' },
      { text: 'Septiembre', value: '9' },
      { text: 'Octubre', value: '10' },
      { text: 'Noviembre', value: '11' },
      { text: 'Diciembre', value: '12' },
    ];
    const startYear = currentYear - 5; // Ajustar el rango de años según sea necesario
    const endYear = currentYear + 0; // Ajustar el rango de años según sea necesario
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
      const year = startYear + i;
      return { text: year.toString(), value: year.toString() };
    });

    const currentDayIndex = currentDay - 1;
    const currentMonthIndex = currentMonth;
    const currentYearIndex = years.findIndex(
      (year) => year.value === currentYear.toString()
    );

    const picker = await this.pickerController.create({
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Seleccionar',
          handler: (value: any) => {
            if (isStartDate) {
              const startDate = new Date(
                `${value.year.text}-${value.month.value}-${value.day.value}`
              );
              this.startDate = startDate;
              this.dateStar = `${startDate.getDate()} ${this.getMonthName(
                startDate.getMonth()
              )} ${startDate.getFullYear()}`;
            } else {
              const selectedDate = new Date(
                `${value.year.text}-${value.month.value}-${value.day.value}`
              );
              const endDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate() + 1
              );
              this.endDate = endDate;
              this.dateEnd = `${endDate.getDate()} ${this.getMonthName(
                endDate.getMonth()
              )} ${endDate.getFullYear()}`;
            }
            this.filterTicketsByDateRange();
          },
        },
      ],
      columns: [
        {
          name: 'day',
          options: days,
          selectedIndex: currentDayIndex,
        },
        {
          name: 'month',
          options: months,
          selectedIndex: currentMonthIndex,
        },
        {
          name: 'year',
          options: years,
          selectedIndex: currentYearIndex,
        },
      ],
    });
    await picker.present();
  }

  getMonthName(monthIndex: number): string {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[monthIndex];
  }

  filterTicketsByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.dateSelect = true;
      return; // Verificar que ambas fechas estén seleccionadas
    }

    this.filteredTickets = this.tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate >= this.startDate! && ticketDate <= this.endDate!;
    });

    this.notTickets = false;
  }

  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.dateStar = 'Fecha Inicio';
    this.dateEnd = 'Fecha Fin';
    this.notTickets = false;
    this.filteredTickets = [...this.tickets];
  }

  getPlaceholder(): string {
    if (this.selectedSegment === 'tickets') {
      return 'Buscar por problema';
    }

    if (this.selectedSegment === 'solicitudes') {
      return 'Buscar por lugar';
    }

    if (this.selectedSegment === 'pdfs') {
      return 'Buscar por motivo';
    }
    return 'Buscar...';
  }

}
