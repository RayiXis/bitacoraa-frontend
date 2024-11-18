import { Component, OnInit } from '@angular/core';
import { ModalController, PickerController, } from '@ionic/angular';
import { Tickets, UserEmployee, UserTechnical, } from '../../interfaces/Bitacora';
import { BitacoraService } from '../../services/bitacora.service';
import { ModalChatComponent, ModalModificarTicketComponent, ModalSolicitarEquipoComponent, } from 'src/app/components';
import { AlertController, ToastController } from '@ionic/angular';
import { Agenda } from '../../interfaces/Accesories';
import { Altas, Pdfs } from '../../interfaces/pdfs.';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bitacora-page',
  templateUrl: './bitacora-page.component.html',
  styleUrls: ['./bitacora-page.component.scss'],
})
export class BitacoraPageComponent implements OnInit {

  selectedSegment: 'tickets' | 'solicitudes' | 'pdfs' = 'tickets';
  public tickets: Tickets[] = [];
  public reportDetail: string[] = [];
  public noTickets: boolean = false;
  public noAgenda: boolean = false;
  public noPdfs: boolean = false;
  public result: string[] = [];
  public filteredTickets: Tickets[] = [];
  public pdfs: Altas[] = [];
  public filteredPdfs: Altas[] = [];
  public term: string = '';
  public technicalProfile!: UserTechnical;
  public isAdmin: boolean = false;
  public userEmployee: { [key: string]: UserEmployee } = {};
  public administrativeUnits: { [key: string]: string } = {};
  public sortDirection: string[] = ['caret-down-circle-outline', 'caret-down-circle-outline', 'caret-down-circle-outline', 'caret-down-circle-outline', 'caret-down-circle-outline'];
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public dateSelect: boolean = false;
  public finishTicket: boolean = false;
  public dateStar: string = 'Fecha Inicio';
  public dateEnd: string = 'Fecha Fin';
  public isLoading: boolean = true;
  public pageTicket: number = 1;
  public limitTicket: number = 10;
  public pageSolicitudes: number = 1;
  public limitSolicitudes: number = 10;
  public pagePdfs: number = 1;
  public limitPdfs: number = 10;
  public lastPageTicket!: number;
  public lastPageSolicitudes!: number;
  public lastPagePdfs!: number;
  public selectedTicket: any;
  public agenda: Agenda[] = [];
  public filteredAgenda: Agenda[] = [];
  public currentDate: Date = new Date();
  public customAlertOptions = {
    header: 'DOCUMENTOS PDF',
    subHeader: 'Selecciona uno para filtrar',
    translucent: true,
  };

  constructor(
    private bitacoraServices: BitacoraService,
    private pickerController: PickerController,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.getAllTicket(this.pageTicket, this.limitTicket);
    this.loadAgenda();
    this.currentUser();
    this.getPdfs('altas', 1, 10);
  }

  segmentChanged(event: any): void {
    this.selectedSegment = event.detail.value as
      | 'tickets'
      | 'solicitudes'
      | 'pdfs';
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      event.target.complete();
      this.getAllTicket(this.pageTicket, this.limitTicket);
      this.loadAgenda();
      this.getPdfs('altas', 1, 10);
    }, 1000);
  }

  getPlaceholder(): string {
    if (this.selectedSegment === 'tickets') {
      return 'Buscar por problema';
    }

    if (this.selectedSegment === 'solicitudes') {
      return 'Buscar por motivo';
    }

    if (this.selectedSegment === 'pdfs') {
      return 'Buscar por usuario';
    }
    return 'Buscar...';
  }

  handleInput(event: any) {
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
      this.noTickets = this.filteredTickets.length === 0;
    }

    if(this.selectedSegment === 'solicitudes') {
      this.filteredAgenda = this.agenda.filter( agenda => {
        return agenda.reason.toLocaleLowerCase().includes(query);
      })
      this.noAgenda = this.filteredAgenda.length === 0;
    }

    if(this.selectedSegment === 'pdfs') {
      this.filteredPdfs = this.pdfs.filter( agenda => {
        return agenda.responsibleName.toLocaleLowerCase().includes(query);
      })
      this.noPdfs = this.filteredAgenda.length === 0;
    }

  }

  filterTickets(query: string) {
    this.filteredTickets = this.tickets.filter((ticket) => {
      return ticket.reportDetail.toLowerCase().includes(query);
      // this.userEmployee[ticket.userId]?.name.toLowerCase().includes(query) ||
      // this.userEmployee[ticket.userId]?.lastname.toLowerCase().includes(query)
    });
    this.noTickets = this.filteredTickets.length === 0;
  }

  setSelectedTicket(ticket: any) {
    this.selectedTicket = ticket;
  }

  hasNotes(ticket: any): boolean {
    // return ticket && Array.isArray(ticket.notes) && ticket.notes.lenght > 0;
    return Array.isArray(ticket.notes);
  }

  async ticketModal(ticket: Tickets) {
    const modal = await this.modalController.create({
      component: ModalModificarTicketComponent,
      componentProps: { ticketId: ticket._id },
    });
    await modal.present();
    await modal.onDidDismiss();

    this.getAllTicket(this.pageTicket, this.limitTicket);

  }

  async openChat(ticket: Tickets) {
    const modal = await this.modalController.create({
      component: ModalChatComponent,
      componentProps: { ticketId: ticket._id },
    });
    await modal.present();
    const { role } = await modal.onDidDismiss()

    if (role === 'backdrop' || role === 'close' || role === 'cancel') {
      this.getAllTicket(this.pageTicket, this.limitTicket);
    }
  }

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
    const endYear = currentYear; // Ajustar el rango de años según sea necesario
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
              // Almacenar la fecha de inicio
              const startDate = new Date(
                `${value.year.text}-${value.month.value}-${value.day.value}`
              );
              this.startDate = startDate;
              this.dateStar = `${startDate.getDate()} ${this.getMonthName(
                startDate.getMonth()
              )} ${startDate.getFullYear()}`;
            } else {
              // Almacenar la fecha de fin y ajustarla para incluir todo el día seleccionado
              const selectedDate = new Date(
                `${value.year.text}-${value.month.value}-${value.day.value}`
              );
              const endDate = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
              );
              this.endDate = endDate;
              this.dateEnd = `${endDate.getDate()} ${this.getMonthName(
                endDate.getMonth()
              )} ${endDate.getFullYear()}`;
            }

            if( this.selectedSegment === 'tickets') {
              this.filterTicketsByDateRange();
            }

            if( this.selectedSegment === 'solicitudes') {
              this.filterSolicitudesByDateRange();
            }
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

  clearDateFilter() {
    this.noTickets = false;
    this.startDate = null;
    this.endDate = null;
    this.dateStar = 'Fecha Inicio';
    this.dateEnd = 'Fecha Fin';

    if(this.selectedSegment === 'tickets'){
      this.filteredTickets = this.tickets;
    }

    if(this.selectedSegment === 'solicitudes'){
      this.filteredAgenda = this.agenda;
    }

    // this.bitacoraServices.getTickets(this.page, this.limit).subscribe( tickets => {
    //   this.tickets = tickets.data;
    //   this.filteredTickets = this.tickets;
    //   this.page = tickets.meta.page;
    //   this.lastPage = tickets.meta.lastPage;
    // })
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
      return;
    }

    const adjustedStartDate = new Date(Date.UTC(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), 0, 0, 0));
    const adjustedEndDate = new Date(Date.UTC(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 23, 59, 59, 999));

    this.bitacoraServices.getTickets(this.pageTicket, this.limitTicket, adjustedStartDate.toISOString(), adjustedEndDate.toISOString()).subscribe(
      res => {
        this.noTickets = false;
        this.filteredTickets = res.data;
        this.pageTicket = res.meta.page;
        this.lastPageTicket = res.meta.lastPage
        if(res.data.length === 0) {
          this.noTickets = true;
          return;
        }
      }, err => {
        console.log(err);
      }
    );

    this.noTickets = this.filteredTickets.length === 0;
  }

  private filterSolicitudesByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.dateSelect = true;
      return;
    }

    const adjustedStartDate = new Date(Date.UTC(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), 0, 0, 0));
    const adjustedEndDate = new Date(Date.UTC(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 23, 59, 59, 999));

    this.bitacoraServices.getAgenda(this.pageSolicitudes, this.limitSolicitudes, adjustedStartDate.toISOString(), adjustedEndDate.toISOString()).subscribe(
      res => {
        this.filteredAgenda = res.data;
        this.pageSolicitudes = res.meta.page;
        this.lastPageSolicitudes = res.meta.lastPage;
      },
      err => {
        console.log(err);
      }
    );
  }

  currentUser() {
    this.bitacoraServices.currentTechnical().subscribe((datosEmpleado) => {
      this.technicalProfile = datosEmpleado;
      if (this.technicalProfile.role === 'admin') {
      this.isAdmin = true;  // Marca al usuario como administrador
    }
      console.log(datosEmpleado);
    });
  }

  finalizeTicket(ticket: Tickets) {
    if (ticket.status === 2) {
      this.alert(
        'ERROR AL FINALIZAR TICKET',
        'Se ha intentado finalizar un ticket ya finalizado'
      );
      return;
    }

    if (ticket.status === 0) {
      this.alert(
        'ERROR AL FINALIZAR TICKET',
        'Se ha intentado finalizar un ticket sin empezarlo'
      );
      return;
    }

    this.alert('FINALIZAR TICKET', '¿Está seguro que desea finalizar el ticket?', [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        role: 'confirm',
        handler: () => {

          this.alert('FINALIZAR TICKET', 'Se ha finalizado el ticket correctamente', [
            {
              text: 'Aceptar',
              role: 'confirm',
              handler: async () => {
                try {
                  await this.toastMessage('Mandar mensaje al usuario que se ha finalizado con su ticket.');
                  await this.openChat(ticket);

                  await this.bitacoraServices.finalizeTicket(ticket._id).toPromise();

                } catch (error) {
                  console.error(error);
                }
              }
            }
          ]);
        },
      },
    ]);
  }

  async toastMessage( message: string ) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'bottom',
    });
    await toast.present();
  }

  getAllTicket(page: number, limit: number): void {
    this.bitacoraServices.getTickets(page, limit).subscribe((response) => {
      this.tickets = response.data;
      this.filteredTickets = [...this.tickets];
      this.isLoading = false;
      this.pageTicket = response.meta.page;
      this.lastPageTicket = response.meta.lastPage;
    });
  }



  loadAgenda() {
    this.bitacoraServices.getAgenda( this.pageSolicitudes, this.limitSolicitudes, '', '', true ).subscribe( agenda => {
      this.agenda = agenda.data;
      this.filteredAgenda = this.agenda;
      this.pageSolicitudes = agenda.meta.page;
      this.lastPageSolicitudes = agenda.meta.lastPage;
    })
  }

  exportAllToCalendar() {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN\n`;

    this.filteredAgenda.forEach((solicitud) => {
      const startDate = new Date(solicitud.initDate);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + solicitud.useHours);

      // Formatear las fechas en el formato adecuado (YYYYMMDDTHHMMSSZ)
      const formattedStartDate = startDate.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';
      const formattedEndDate = endDate.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';

      icsContent += `BEGIN:VEVENT
DTSTART:${formattedStartDate}
DTEND:${formattedEndDate}
SUMMARY:Equipo Solicitado: ${solicitud.equipmentName}
DESCRIPTION:Motivo: ${solicitud.reason}
LOCATION:${solicitud.place}
ATTENDEE;CN="${solicitud.userName}";RSVP=TRUE:
END:VEVENT\n`;
    });

    icsContent += 'END:VCALENDAR';

    // Crear archivo Blob para descargar
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'solicitudes-equipos.ics';
    link.click();
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

    this.loadAgenda();

  }

  getPdfs( term: string, page?: number, limit?: number ) {
    this.bitacoraServices.getPdfs(term, page, limit ).subscribe( (res: Pdfs) => {
      this.pdfs = res.data;
      this.filteredPdfs = [...this.pdfs]
      this.pagePdfs = res.meta.page
      this.lastPagePdfs = res.meta.lastPage
    }, err => {
      console.error(err);
    })
  }

  openDocument( nombrePdf: string, folder: string ) {
    const baseUrl = environment.apiUrl;
    const url = `${baseUrl}/documents/${folder}/${nombrePdf}.pdf`;
    window.open(url, '_blank');
  }

  changeSelectedFilter(event: CustomEvent) {
    this.term = event.detail.value;
    this.getPdfs(this.term, this.pagePdfs, this.limitPdfs )
  }

  hasEndDatePassed( solicitud: Agenda ): boolean {
    if( !solicitud ) {
      return false;
    }

    const nowDate = new Date().getTime();
    const endDate = new Date(solicitud.endDate).getTime();
    return endDate < nowDate;
  }

  requestSelected( request: Agenda ) {
    this.alert('Recoger accesorio', "¿Estás seguro que este accesorio ya ha sido recogido?", [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        role: 'confirm',
        handler: () => {
          this.bitacoraServices.pickUpAccesory(request._id).subscribe( res => {
            this.toastMessage('El equipo se ha recogido y almacenado correctamente')
            this.loadAgenda();
          },err => {
            console.log(err);
            this.alert('Problemas al recoger acceosrio', 'Un problema inesperado a ocurrido en este proceso. Intente más tarde.')
          });
        }
      }
    ])
  }

  // getAccesoryById( id: string ) {
  //   this.bitacoraServices.getAccesoryById(id).subscribe( accesory => {

  //   })
  // }

  getLimitData() {
    let limit;
    if(this.selectedSegment === 'tickets'){
      limit = this.limitTicket;
    }
    if(this.selectedSegment === 'solicitudes') {
      limit = this.limitSolicitudes;
    }
    if(this.selectedSegment === 'pdfs') {
      limit = this.limitPdfs;
    }
    return limit;
  }

  changeRowsPerPage(limit: number) {

    if(this.selectedSegment === 'tickets') {
      this.limitTicket = limit;
      this.getAllTicket(this.pageTicket, this.limitTicket);
      return;
    }

    if(this.selectedSegment === 'solicitudes') {
      this.limitSolicitudes = limit;
      this.loadAgenda();
      return;
    }

    if(this.selectedSegment === 'pdfs') {
      this.limitPdfs = limit;
      this.getPdfs(this.term, this.pagePdfs, limit)
      return;
    }

  }

  changePage(direction: number) {
    if (this.pageTicket + direction > 0 && this.pageTicket + direction <= this.lastPageTicket && this.selectedSegment === 'tickets') {
      this.pageTicket += direction;
      this.getAllTicket(this.pageTicket, this.limitTicket);
      return;
    }

    if (this.pageSolicitudes + direction > 0 && this.pageSolicitudes + direction <= this.lastPageSolicitudes && this.selectedSegment === 'solicitudes') {
      this.pageSolicitudes += direction;
      this.loadAgenda();
      return;
    }

    if (this.pagePdfs + direction > 0 && this.pagePdfs + direction <= this.lastPagePdfs && this.selectedSegment === 'pdfs') {
      this.pagePdfs += direction;
      this.getPdfs(this.term, this.pagePdfs, this.limitPdfs);
      return;
    }
  }

  getUserById(id: string) {
    this.bitacoraServices.getEmployeeById(id).subscribe((userEmployee) => {
      this.userEmployee[id] = userEmployee;

      const code = userEmployee.code.substring(0, 5);
      this.bitacoraServices.getAdmministrativeUnitByCode( code ).subscribe( direccion => {
        this.administrativeUnits[id] = direccion.name
      })

    });
  }

  // getTechnById(id: string) {
  //   this.bitacoraServices.getTechnicalById(id).subscribe((userTech) => {
  //     const fullName = `${userTech.name} ${userTech.lastname}`;

  //     // Asignar el nombre del técnico a cada ticket que tenga el mismo technicalId
  //     this.tickets.forEach((ticket) => {
  //       if (ticket.technicalId === id) {
  //         ticket.assignedTechnical = fullName; // Asigna el nombre directamente al ticket
  //       }
  //     });

  //     // Actualiza los tickets filtrados también
  //     this.filteredTickets = [...this.tickets];
  //   });
  // }

  getStatusClass(ticket: Tickets) {
    switch (ticket.status) {
      case 0:
        return 'status-pendiente';
      case 1:
        return 'status-proceso';
      case 2:
        return 'status-completado';
      default:
        return '';
    }
  }

  sortTable(n: number) {
    this.sortDirection[n] =
      this.sortDirection[n] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    let table,
      rows,
      switching,
      i,
      x,
      y,
      shouldSwitch,
      dir,
      switchcount = 0;
    table = document.getElementById('report-table') as HTMLTableElement;
    switching = true;
    dir = 'asc';
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < rows.length - 1; i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName('TD')[n];
        y = rows[i + 1].getElementsByTagName('TD')[n];
        if (dir == 'asc') {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == 'desc') {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode?.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
      } else {
        if (switchcount == 0 && dir == 'asc') {
          dir = 'desc';
          switching = true;
        }
      }
    }
  }

  async changeStatus(status: number) {
    if(this.selectedSegment === 'solicitudes') {
      if(status === 0){
        this.bitacoraServices.getAgenda(this.pageSolicitudes, this.limitSolicitudes, undefined, undefined, true ).subscribe(
          res => {
            this.agenda = res.data;
            this.filteredAgenda = this.agenda;
            this.pageSolicitudes = res.meta.page;
            this.lastPageSolicitudes = res.meta.lastPage;
          },err => {
            console.error(err);
          }
        );
        return;
      }

      if(status === 1) {
        this.bitacoraServices.getAgenda(this.pageSolicitudes, this.limitSolicitudes ).subscribe(
          res => {
            this.agenda = res.data;
            this.filteredAgenda = this.agenda;
            this.pageSolicitudes = res.meta.page;
            this.lastPageSolicitudes = res.meta.lastPage;
          },err => {
            console.error(err);
          }
        );
      }
    }

    if(this.selectedSegment === 'tickets') {
      this.bitacoraServices.getTickets(this.pageTicket, this.limitTicket, undefined, undefined, status).subscribe(
        res => {
          this.filteredTickets = res.data;
          this.pageTicket = res.meta.page;
          this.lastPageTicket = res.meta.lastPage;
        }, err => {
          console.error(err);
        }
      )

      if (status === 3) {
        this.filteredTickets = this.tickets;
        return;
      }
    }


    const statusSpanStyle = document.getElementById('statusSpanStyle');
    if (statusSpanStyle) {
      // statusSpanStyle.classList.remove('status');

      switch (status) {
        case 0:
          statusSpanStyle.classList.add('status-circle status-pendiente');
          break;
        case 1:
          statusSpanStyle.classList.add('status-circle status-proceso');
          break;
        case 2:
          statusSpanStyle.classList.add('status-circle status-completado');
          break;
        case 3:
          statusSpanStyle.classList.add('status');
          break;
      }
    }
  }

  getElapsedHours(ticket: Tickets): string {
    const createdDate = new Date(ticket.createdAt);
    const currentDate = new Date();
    const status = ticket.status;

    if (status !== 0 && ticket.dateTimeStart) {
      // Calcular diferencia de tiempo desde la creación del ticket hasta el cambio de estado
      const statusChangeDate = new Date(ticket.dateTimeStart);
      const diffInMs = statusChangeDate.getTime() - createdDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffInHours > 0) {
        return `${diffInHours} hrs`;
      } else {
        return `${minutes} min`;
      }
    } else {
      // Calcular diferencia de tiempo normalmente si el ticket está en estado pendiente o no ha sido actualizado
      const diffInMs = currentDate.getTime() - createdDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffInHours > 0) {
        return `${diffInHours} hrs`;
      } else {
        return `${remainingMinutes} min`;
      }
    }
  }

  getInProgressTime(ticket: Tickets): string {
    if (!ticket.dateTimeStart) {
      return 'N/A';
    }

    const dateTimeStart = new Date(ticket.dateTimeStart);
    const endDate = ticket.dateTimeEnd
      ? new Date(ticket.dateTimeEnd)
      : new Date();
    const diffInMs = endDate.getTime() - dateTimeStart.getTime();

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (diffInHours > 0) {
      return `${diffInHours} hrs`;
    } else {
      return '< 1 hra';
    }
  }

  finishedTicket(status: number): boolean {
    return status === 2;
  }

  exportTable() {
    if( this.selectedSegment === 'tickets' ){
      this.exportToExcel('table-tickets', 'Reportes de tickets', 'Exportar Tickets a Excel');
    }
    if( this.selectedSegment === 'solicitudes' ){
      this.exportToExcel('table-solicitudes', 'Reportes de solicitudes de equipos', 'Exportar Solicitudes a Excel');
    }
    if( this.selectedSegment === 'pdfs' ){
      this.exportToExcel('table-pdfs', 'Reportes de pdfs', 'Exportar Pdfs a Excel');
    }
  }

  exportToExcel(tableId: string, fileName: string, title: string): void {
    this.alert(
      title,
      '¿Estás seguro de exportar esta tabla a excel?',
      [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: () => {
            this.bitacoraServices.exportTableToExcel(tableId, fileName);
          },
        },
      ]
    );
  }

  async alert(header: string, message: string, btns: any[] = ['Ok']) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: header,
      message: message,
      buttons: btns,
    });
    await alert.present();
  }
}
