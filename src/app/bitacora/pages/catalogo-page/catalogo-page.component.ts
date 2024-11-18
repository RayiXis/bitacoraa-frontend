import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BitacoraService } from '../../services/bitacora.service';
import { Router } from '@angular/router';
import {
  ModalController,
  AlertController,
  PopoverController,
} from '@ionic/angular';
import { ModalEquipoComponent } from 'src/app/components/modal-equipo/modal-equipo.component';
import { CatalogosService } from 'src/app/services/catalogos/catalogos.service';
import { ModalAccesoriosComponent } from 'src/app/components';
import {
  Bitacora,
  UserEmployee,
  UserTechnical,
} from '../../interfaces/Bitacora';
import { PerifericosComponent } from 'src/app/components/perifericos/perifericos.component';
import { environment } from 'src/environments/environment';

import { ModalAssignDeviceComponent } from 'src/app/components/modal-assign-device/modal-assign-device.component';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ModalAssignPeripheralComponent } from 'src/app/components/modal-assign-peripheral/modal-assign-peripheral.component';
import { PermisosComponent } from 'src/app/components/permisos/permisos.component';
import { jwtDecode } from 'jwt-decode';
import { RoleespPipe } from '../../pipes/roleesp.pipe';
import { ModalImportarEquiposComponent } from 'src/app/components/modal-importar-equipos/modal-importar-equipos.component';

@Component({
  selector: 'app-catalogo-page',
  templateUrl: './catalogo-page.component.html',
  styleUrls: ['./catalogo-page.component.scss'],
  providers: [RoleespPipe],
})
export class CatalogoPageComponent {
  private api = environment.apiUrl;
  selectedSegment: 'usuarios' | 'equipos' | 'perifericos' | 'accesorios' =
    'usuarios';
  user: any[] = [];
  public userRole: string = '';
  public pageUsuarios: number = 1;
  public limitUsuarios: number = 10;
  public lastPageUsuarios!: number;

  equipments: any[] = [];
  equipment: any[] = [];
  public pageEquipos: number = 1;
  public limitEquipos: number = 10;
  public lastPageEquipos!: number;

  peripheral: any[] = [];
  public pagePeriferico: number = 1;
  public limitPeriferico: number = 10;
  public lastPagePeriferico!: number;

  accesory: any[] = [];
  public pageAccesorio: number = 1;
  public limitAccesorio: number = 10;
  public lastPageAccesorio!: number;

  filteredUser: any[] = [];
  filteredEquipment: any[] = [];
  filteredAccesory: any[] = [];
  filteredPhones: any[] = [];
  filteredPeripheral: any[] = [];
  loggedUser: any;
  public userEmployee: { [key: string]: UserEmployee } = {};
  administrativeUnits: { [key: string]: string } = {};

  noCatalogoData = false;

  public isLoading: boolean = true;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  public sortCatalogo: string[] = Array(13).fill('caret-down-circle-outline');

  public page: number = 1;
  public limit: number = 10;
  public lastPage: number = 0;

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private catalogoService: CatalogosService,
    private roleespPipe: RoleespPipe
  ) {}

  ngOnInit() {
    this.loadUsers(this.pageUsuarios, this.limitUsuarios);
    this.extractUserRole();
    this.loadEquipment(this.pageEquipos, this.limitEquipos);
    this.loadPeripheal(this.pagePeriferico, this.limitPeriferico);
    this.loadAccesory(this.pageAccesorio, this.limitAccesorio);
    this.getLoggedUser();
  }
  /*-----------------------HAS ROLE---------------------------------*/
  extractUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userRole = decodedToken.Role;
      } catch (error) {
        console.error('Error decodificando el token', error);
      }
    } else {
      console.warn('No se encontró el token');
    }
  }

  hasRole(...roles: string[]): boolean {
    if (this.userRole) {
      return roles.includes(this.userRole);
    } else {
      return false;
    }
  }

  // Llama a esta función después de filtrar los datos en cada sección
  checkIfDataExists() {
    switch (this.selectedSegment) {
      case 'usuarios':
        this.noCatalogoData = this.filteredUser.length === 0;
        break;
      case 'equipos':
        this.noCatalogoData = this.filteredEquipment.length === 0;
        break;
      case 'perifericos':
        this.noCatalogoData = this.filteredPeripheral.length === 0;
        break;
      case 'accesorios':
        this.noCatalogoData = this.filteredAccesory.length === 0;
        break;
      default:
        this.noCatalogoData = true;
        break;
    }
  }

  getLimitData() {
    let limit;
    if (this.selectedSegment === 'usuarios') {
      limit = this.limitUsuarios;
    }
    if (this.selectedSegment === 'equipos') {
      limit = this.limitEquipos;
    }
    if (this.selectedSegment === 'perifericos') {
      limit = this.limitPeriferico;
    }
    if (this.selectedSegment === 'accesorios') {
      limit = this.limitAccesorio;
    }
    return limit;
  }

  changeRowsPerPage(limit: number) {
    switch (this.selectedSegment) {
      case 'usuarios':
        this.limitUsuarios = limit;
        this.loadUsers(this.pageUsuarios, this.limitUsuarios);
        break;
      case 'equipos':
        this.limitEquipos = limit;
        this.loadEquipment(this.pageEquipos, this.limitEquipos);
        break;
      case 'perifericos':
        this.limitPeriferico = limit;
        this.loadPeripheal(this.pagePeriferico, this.limitPeriferico);
        break;
      case 'accesorios':
        this.limitAccesorio = limit;
        this.loadAccesory(this.pageAccesorio, this.limitAccesorio);
        break;
    }
  }

  changePage(direction: number) {
    switch (this.selectedSegment) {
      case 'usuarios':
        if (
          this.pageUsuarios + direction > 0 &&
          this.pageUsuarios + direction <= this.lastPageUsuarios
        ) {
          this.pageUsuarios += direction;
          this.loadUsers(this.pageUsuarios, this.limitUsuarios);
        }
        break;
      case 'equipos':
        if (
          this.pageEquipos + direction > 0 &&
          this.pageEquipos + direction <= this.lastPageEquipos
        ) {
          this.pageEquipos += direction;
          this.loadEquipment(this.pageEquipos, this.limitEquipos);
        }
        break;
      case 'perifericos':
        if (
          this.pagePeriferico + direction > 0 &&
          this.pagePeriferico + direction <= this.lastPagePeriferico
        ) {
          this.pagePeriferico += direction;
          this.loadPeripheal(this.pagePeriferico, this.limitPeriferico);
        }
        break;
      case 'accesorios':
        if (
          this.pageAccesorio + direction > 0 &&
          this.pageAccesorio + direction <= this.lastPageAccesorio
        ) {
          this.pageAccesorio += direction;
          this.loadAccesory(this.pageAccesorio, this.limitAccesorio);
        }
        break;
    }
  }

  getLoggedUser() {
    this.http.get(`${this.api}/users/profile`).subscribe((res: any) => {
      this.loggedUser = res;
    });
  }
  getUserById(id: string) {
    this.catalogoService.getEmployeeById(id).subscribe((userEmployee) => {
      this.userEmployee[id] = userEmployee;

      const code = userEmployee.code.substring(0, 5);
      this.catalogoService
        .getAdmministrativeUnitByCode(code)
        .subscribe((direccion) => {
          this.administrativeUnits[id] = direccion.name;
        });
    });
  }

  segmentChanged(event: any): void {
    this.selectedSegment = event.detail.value as
      | 'usuarios'
      | 'equipos'
      | 'perifericos'
      | 'accesorios';
    this.filterItems();
  }

  // Método para manejar los filtros de estado
  applyStatusFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.filterItems();
  }

  filterSearchCatalogoItems(event?: any): void {
    const searchTerm = event?.target.value.toLowerCase() || '';

    if (this.selectedSegment === 'usuarios') {
      this.filteredUser = this.user.filter((user) => {
        const translatedRole = this.roleespPipe
          .transform(user.role)
          .toLowerCase();
        return (
          user.secretariaName?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.direccionName?.toLowerCase().includes(searchTerm) ||
          '' ||
          translatedRole.includes(searchTerm) ||
          '' ||
          user.name?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.lastname?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.email?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.phone?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.job?.toLowerCase().includes(searchTerm) ||
          '' ||
          user.type?.toLowerCase().includes(searchTerm)
        );
      });
    } else if (this.selectedSegment === 'equipos') {
      this.filteredEquipment = this.equipment.filter((equipment) => {
        return (
          equipment.sindicatura_Inventory_Code
            ?.toLowerCase()
            .includes(searchTerm) ||
          '' ||
          equipment.userName?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.location?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.description?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.codeID?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.assigned_ip?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.directionEthernet?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.hdd?.toLowerCase().includes(searchTerm) ||
          '' ||
          equipment.address?.toLowerCase().includes(searchTerm)
        );
      });
    } else if (this.selectedSegment === 'perifericos') {
      this.filteredPeripheral = this.peripheral.filter((peripheral) => {
        return (
          peripheral.ownerName?.toLowerCase().includes(searchTerm) ||
          '' ||
          peripheral.location?.toLowerCase().includes(searchTerm) ||
          '' ||
          peripheral.inventoryCode?.toLowerCase().includes(searchTerm) ||
          '' ||
          peripheral.description?.toLowerCase().includes(searchTerm) ||
          '' ||
          peripheral.ip?.toLowerCase().includes(searchTerm) ||
          '' ||
          peripheral.type?.toLowerCase().includes(searchTerm)
        );
      });
    } else if (this.selectedSegment === 'accesorios') {
      this.filteredAccesory = this.accesory.filter((accesory) => {
        return (
          accesory.description?.toLowerCase().includes(searchTerm) ||
          '' ||
          accesory.inventoryNumber?.toLowerCase().includes(searchTerm) ||
          ''
        );
      });
    }
    this.checkIfDataExists();
  }

  private filterItems() {
    switch (this.selectedSegment) {
      case 'usuarios':
        this.filterUser();
        break;
      case 'equipos':
        this.filterEquipment();
        break;
      case 'perifericos':
        this.filterPeripheral();
        break;
      case 'accesorios':
        this.filterAccesory();
        break;
      default:
        break;
    }
    this.checkIfDataExists();
  }

  //Descomentar cuando le pongan un active a user
  private filterUser() {
    this.filteredUser = this.user.filter((user) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && user.status === 0) ||
        (this.filterStatus === 'inactive' && user.status === 2);
      return statusMatch;
    });
  }

  private filterEquipment() {
    this.filteredEquipment = this.equipment.filter((equipment) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && equipment.state) ||
        (this.filterStatus === 'inactive' && !equipment.state);
      return statusMatch;
    });
  }

  private filterPeripheral() {
    this.filteredPeripheral = this.peripheral.filter((peripheral) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && peripheral.state) ||
        (this.filterStatus === 'inactive' && !peripheral.state);
      return statusMatch;
    });
  }

  private filterAccesory() {
    this.filteredAccesory = this.accesory.filter((accesory) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && accesory.state) ||
        (this.filterStatus === 'inactive' && !accesory.state);
      return statusMatch;
    });
  }

  // Método para ordenar la tabla de usuarios
  sortUserTable(property: string, columnIndex: number) {
    this.sortCatalogo[columnIndex] =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline' ? 1 : -1;

    this.filteredUser.sort((a, b) => {
      const aValue = a[property] ? a[property].toString().toLowerCase() : ''; // Convertir a string si es necesario
      const bValue = b[property] ? b[property].toString().toLowerCase() : ''; // Convertir a string si es necesario

      if (aValue < bValue) {
        return -1 * direction;
      } else if (aValue > bValue) {
        return 1 * direction;
      } else {
        return 0;
      }
    });

    // Reinicia los otros íconos a su estado predeterminado
    this.sortCatalogo = this.sortCatalogo.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Método para ordenar la tabla de equipos
  sortEquipmentTable(property: string, columnIndex: number) {
    this.sortCatalogo[columnIndex] =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline' ? 1 : -1;

    this.filteredEquipment.sort((a, b) => {
      const aValue = a[property] ? a[property].toLowerCase() : '';
      const bValue = b[property] ? b[property].toLowerCase() : '';

      if (aValue < bValue) {
        return -1 * direction;
      } else if (aValue > bValue) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
  }
  sortPeripheralTable(property: string, columnIndex: number) {
    this.sortCatalogo[columnIndex] =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline' ? 1 : -1;

    this.filteredPeripheral.sort((a, b) => {
      const aValue = a[property] ? a[property].toLowerCase() : '';
      const bValue = b[property] ? b[property].toLowerCase() : '';

      if (aValue < bValue) {
        return -1 * direction;
      } else if (aValue > bValue) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
  }
  // Método para ordenar la tabla de accesorios
  sortAccesoryTable(property: string, columnIndex: number) {
    this.sortCatalogo[columnIndex] =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline' ? 1 : -1;

    this.filteredAccesory.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });

    // Reinicia los otros íconos a su estado predeterminado
    this.sortCatalogo = this.sortCatalogo.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Método para ordenar la tabla de telefonos
  sortPhoneTable(property: string, columnIndex: number) {
    this.sortCatalogo[columnIndex] =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortCatalogo[columnIndex] === 'caret-down-circle-outline' ? 1 : -1;

    this.filteredPhones.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
    // Reinicia los otros íconos a su estado predeterminado
    this.sortCatalogo = this.sortCatalogo.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  //Métodos para llamar SERVICES
  private loadUsers(page: number, limit: number) {
    this.catalogoService.getUsers(page, limit).subscribe((data) => {
      this.isLoading = false;
      this.user = data.data;
      this.pageUsuarios = data.meta.page;
      this.lastPageUsuarios = data.meta.lastPage;
      this.filterUser();
      this.checkIfDataExists();
    });
  }
  private loadEquipment(page: number, limit: number) {
    this.catalogoService.getEquipment(page, limit).subscribe((data) => {
      this.isLoading = false;
      this.equipment = data.data;
      this.pageEquipos = data.meta.page;
      this.lastPageEquipos = data.meta.lastPage;
      this.filterEquipment();
      this.checkIfDataExists();
      this.loadAssignedUsers();

      // Procesar los usuarios asignados después de cargar los equipos
      this.loadAssignedUsers();
      this.addAddressesToEquipments();
    });
  }

  loadAssignedUsers() {
    const userRequests = this.equipment.map((equipment) =>
      this.http.get(`${this.api}/users/get-user/${equipment.userId}`)
    );

    forkJoin(userRequests).subscribe((userResponses: any[]) => {
      this.equipment = this.equipment.map((equipment, index) => ({
        ...equipment,
        assignedUser: userResponses[index],
      }));
      this.filterEquipment(); // Aplica el filtro después de cargar los usuarios
    });
  }

  private addAddressesToEquipments() {
    const equipmentRequests = this.equipment.map((equipment) => {
      if (equipment.userId) {
        return this.catalogoService.getUserById(equipment.userId).pipe(
          map((user) => {
            // Asigna la dirección directamente del campo code
            equipment.address =
              user?.administrativeUnitName || 'Dirección no encontrada';
            equipment.assignedUser = user; // Almacena el usuario asignado para mostrar nombre y apellido
            return equipment;
          }),
          catchError(() => {
            equipment.address = 'Error al obtener la dirección';
            return of(equipment);
          })
        );
      } else {
        equipment.address = 'Usuario no asignado';
        return of(equipment);
      }
    });

    // Esperar a que todas las solicitudes se completen
    forkJoin(equipmentRequests).subscribe((equipments) => {
      this.equipment = equipments;
      this.filterEquipment(); // Filtrar después de que se hayan asignado las direcciones
    });
  }

  private loadPeripheal(page: number, limit: number) {
    this.catalogoService.getPeripheral(page, limit).subscribe((data) => {
      this.isLoading = false;
      this.peripheral = data.data;
      this.pagePeriferico = data.meta.page;
      this.lastPagePeriferico = data.meta.lastPage;
      this.filterPeripheral();
      this.checkIfDataExists();
    });
  }
  private loadAccesory(page: number, limit: number) {
    this.catalogoService.getAccesory(page, limit).subscribe((data) => {
      this.isLoading = false;
      this.accesory = data.data;
      this.pageAccesorio = data.meta.page;
      this.lastPageAccesorio = data.meta.lastPage;
      this.filterAccesory();
      this.checkIfDataExists();
    });
  }

  /*BORRADOS*/

  async deleteEquipment(equipment: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el equipo ${equipment.description}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.catalogoService
              .deleteEquipment(equipment._id)
              .subscribe(() => {
                this.equipment = this.equipment.filter(
                  (e) => e._id !== equipment._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async deletePeripheral(peripheral: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el periferico ${peripheral.description}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.catalogoService
              .deletePeripheral(peripheral._id)
              .subscribe(() => {
                this.peripheral = this.peripheral.filter(
                  (p) => p._id !== peripheral._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteAccesory(accesory: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el accesorio ${accesory.description}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.catalogoService.deleteAccesory(accesory._id).subscribe(() => {
              this.accesory = this.accesory.filter(
                (a) => a._id !== accesory._id
              );
              this.filterItems();
            });
          },
        },
      ],
    });
    await alert.present();
  }
  /*--------------------------------------------------------------*/
  /*MODAL*/
  async openModal() {
    switch (this.selectedSegment) {
      case 'equipos':
        await this.openModalEquipo();
        break;
      case 'accesorios':
        await this.openModalAccesorio();
        break;
      default:
        break;
    }
  }
  async openPerifericosModal() {
    const modal = await this.modalController.create({
      component: PerifericosComponent,
      componentProps: {
        periferico: null,
      },
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('Datos del periférico:', data);
    }
  }
  /*MODAL FOTOS DE EQUIPO*/
  async openPhotosModal(equipment: any) {
    const modal = await this.modalController.create({
      component: 'ModalPage',
      componentProps: {
        photos: equipment.photos,
      },
    });
    return await modal.present();
  }

  /*MODAL EQUIPO*/
  async openModalEquipo() {
    const modal = await this.modalController.create({
      component: ModalEquipoComponent,
      backdropDismiss: false,
    });
    await modal.present();
    await modal.onDidDismiss();

    this.loadEquipment(this.page, this.limit);
  }
  async editarEquipo(equipment: any) {
    const modal = await this.modalController.create({
      component: ModalEquipoComponent,
      componentProps: {
        equipment: equipment,
      },
      backdropDismiss: false,
    });
    await modal.present();
    await modal.onDidDismiss();

    this.loadEquipment(this.page, this.limit);
  }

  async importModal() {
    const modal = await this.modalController.create({
      component: ModalImportarEquiposComponent,
    });
    await modal.present();

    await modal.onDidDismiss();

    this.loadEquipment(this.page, this.limit);
  }

  async editarPeriferico(periferico: any) {
    const modal = await this.modalController.create({
      component: PerifericosComponent,
      componentProps: {
        periferico: periferico,
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }
  /*---------------------------------------------------------------*/
  /*MODAL ACCESORIO*/
  async openModalAccesorio() {
    const modal = await this.modalController.create({
      component: ModalAccesoriosComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }
  async editarAccesorio(accesorio: any) {
    const modal = await this.modalController.create({
      component: ModalAccesoriosComponent,
      componentProps: {
        accesorio: accesorio,
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }

  /*MODAL TELEFONO*/
  async editarTelefono(telefono: any) {
    const modal = await this.modalController.create({
      component: PerifericosComponent,
      componentProps: {
        telefono: telefono,
      },
      backdropDismiss: false,
    });
    return await modal.present();
  }

  /*---------------------------- ASIGNAR EQUIPO A USUARIO ----------------------------*/

  async assignDevice(deviceId: string) {
    const modal = await this.modalController.create({
      component: ModalAssignDeviceComponent,
      componentProps: { deviceId: deviceId },
    });

    return await modal.present();
  }
  /*---------------------------- ASIGNAR PERIFERICO A USUARIO ----------------------------*/
  async assignPeripheral(peripheralId: string) {
    const modal = await this.modalController.create({
      component: ModalAssignPeripheralComponent,
      componentProps: { peripheralId: peripheralId },
    });
    return await modal.present();
  }
  /*---------------------------- CAMBIAR PERMISOS DE USUARIO ----------------------------*/
  async givePermissions(userId: string) {
    const modal = await this.modalController.create({
      component: PermisosComponent,
      componentProps: { userId: userId },
      backdropDismiss: false,
    });
    await modal.present();
  }
  /*----------------------------EXPORTAR A EXCEL----------------------------*/
  exportExcelCatalogo() {
    const segmentName =
      this.selectedSegment === 'usuarios'
        ? 'usuarios'
        : this.selectedSegment === 'equipos'
        ? 'equipos'
        : this.selectedSegment === 'perifericos'
        ? 'periféricos'
        : 'accesorios';

    this.alert(
      `Exportar ${segmentName} a Excel`,
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
            const tableId = `${this.selectedSegment}-table`; // Asegúrate de que el ID de la tabla coincida
            const fileName = `${this.selectedSegment}_data`;
            this.catalogoService.exportTableToExcel(
              tableId,
              fileName,
              this.userRole
            );
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
