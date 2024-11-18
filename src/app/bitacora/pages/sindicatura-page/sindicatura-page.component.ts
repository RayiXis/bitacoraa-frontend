import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController, AlertController } from '@ionic/angular';
import { ModalVehiculoComponent } from 'src/app/components/modal-vehiculo/modal-vehiculo.component';
import { ModalMueblesComponent } from 'src/app/components/modal-muebles/modal-muebles.component';

import { SindicaturaService } from 'src/app/services/sindicatura/sindicatura.service';
import { Observable } from 'rxjs';
import { ModalPuestoComponent } from 'src/app/components/modal-dependencias/modal-dependencias.component';
import { ModalDireccionesComponent } from 'src/app/components/modal-direcciones/modal-direcciones.component';
import { jwtDecode } from 'jwt-decode';
import { ModalAssignCarsComponent } from 'src/app/components/modal-assign-cars/modal-assign-cars.component';
import { ModalAssignMuebleComponent } from 'src/app/components/modal-assign-mueble/modal-assign-mueble.component';
import { ModalInmueblesComponent } from 'src/app/components/modal-inmuebles/modal-inmuebles.component';

@Component({
  selector: 'app-sindicatura-page',
  templateUrl: './sindicatura-page.component.html',
  styleUrls: ['./sindicatura-page.component.scss'],
})
export class SindicaturaPageComponent implements OnInit {
  vehiculo: any[] = [];
  public pageVehiculo: number = 1;
  public limitVehiculo: number = 10;
  public lastPageVehiculo!: number;

  mobiliario: any[] = [];
  public pageMobiliario: number = 1;
  public limitMobiliario: number = 10;
  public lastPageMobiliario!: number;

  inmobiliario: any[] = [];
  public pageInmobiliario: number = 1;
  public limitInmobiliario: number = 10;
  public lastPageInmobiliario!: number;

  dependencias: any[] = [];
  public pageDependencias: number = 1;
  public limitDependencias: number = 10;
  public lastPageDependencias!: number;

  direcciones: any[] = [];
  public pageDirecciones: number = 1;
  public limitDirecciones: number = 10;
  public lastPageDirecciones!: number;

  selectedSegment:
    | 'vehiculos'
    | 'mobiliario'
    | 'inmobiliario'
    | 'dependencias'
    | 'direcciones' = 'vehiculos';

  filteredCars: any[] = [];
  filteredFurniture: any[] = [];
  filteredTerrain: any[] = [];
  filteredDependencies: any[] = [];
  filteredDirections: any[] = [];

  noSindicaturaData = false;

  public isLoading: boolean = true;
  public userRole: string | null = null;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  public sortSindicatura: string[] = Array(34).fill(
    'caret-down-circle-outline'
  );

  constructor(
    private http: HttpClient,
    private modalController: ModalController,
    private sindicaturaService: SindicaturaService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadVehiculo(this.pageVehiculo, this.limitVehiculo);
    this.loadMuebles(this.pageMobiliario, this.limitMobiliario);
    this.loadInmobiliario(this.pageInmobiliario, this.limitInmobiliario);
    this.loadDependencias(this.pageDependencias, this.limitDependencias);
    this.loadDirecciones(this.pageDirecciones, this.limitDirecciones);
    this.extractUserRole();
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
      case 'vehiculos':
        this.noSindicaturaData = this.filteredCars.length === 0;
        break;
      case 'mobiliario':
        this.noSindicaturaData = this.filteredFurniture.length === 0;
        break;
      case 'inmobiliario':
        this.noSindicaturaData = this.filteredTerrain.length === 0;
        break;
      case 'dependencias':
        this.noSindicaturaData = this.filteredDependencies.length === 0;
        break;
      case 'direcciones':
        this.noSindicaturaData = this.filteredDirections.length === 0;
        break;
      default:
        this.noSindicaturaData = true;
        break;
    }
  }

  /*MODALS*/
  async openModal() {
    switch (this.selectedSegment) {
      case 'vehiculos':
        await this.openModalVehiculo();
        break;
      case 'mobiliario':
        await this.openModalMobiliario();
        break;
      case 'inmobiliario':
        await this.openModalInmobiliario();
        break;
      case 'dependencias':
        await this.openModalPuesto();
        break;
      case 'direcciones':
        await this.openModalDirecciones();
        break;
      default:
        console.error('Segmento no reconocido');
        break;
    }
  }
  async openModalPuesto() {
    const modal = await this.modalController.create({
      component: ModalPuestoComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }
  /*Modal Direccion*/
  async openModalDirecciones() {
    const modal = await this.modalController.create({
      component: ModalDireccionesComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }
  /*Modal Vehiculo*/
  async openModalVehiculo() {
    const modal = await this.modalController.create({
      component: ModalVehiculoComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  /*Modal Mobiliario*/
  async openModalMobiliario() {
    const modal = await this.modalController.create({
      component: ModalMueblesComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }
  /*Modal Inmobiliario*/
  async openModalInmobiliario() {
    const modal = await this.modalController.create({
      component: ModalInmueblesComponent,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  getLimitData() {
    let limit;
    if (this.selectedSegment === 'vehiculos') {
      limit = this.limitVehiculo;
    }
    if (this.selectedSegment === 'mobiliario') {
      limit = this.limitMobiliario;
    }
    if (this.selectedSegment === 'inmobiliario') {
      limit = this.limitInmobiliario;
    }
    if (this.selectedSegment === 'dependencias') {
      limit = this.limitDependencias;
    }
    if (this.selectedSegment === 'direcciones') {
      limit = this.limitDirecciones;
    }
    return limit;
  }

  changeRowsPerPage(limit: number) {
    switch (this.selectedSegment) {
      case 'vehiculos':
        this.limitVehiculo = limit;
        this.loadVehiculo(this.pageVehiculo, this.limitVehiculo);
        break;
      case 'mobiliario':
        this.limitMobiliario = limit;
        this.loadMuebles(this.pageMobiliario, this.limitMobiliario);
        break;
      case 'inmobiliario':
        this.limitInmobiliario = limit;
        this.loadInmobiliario(this.pageInmobiliario, this.limitInmobiliario);
        break;
      case 'dependencias':
        this.limitDependencias = limit;
        this.loadDependencias(this.pageDependencias, this.limitDependencias);
        break;
      case 'direcciones':
        this.limitDirecciones = limit;
        this.loadDirecciones(this.pageDirecciones, this.limitDirecciones);
        break;
    }
  }

  changePage(direction: number) {
    if (
      this.pageVehiculo + direction > 0 &&
      this.pageVehiculo + direction <= this.lastPageVehiculo &&
      this.selectedSegment === 'vehiculos'
    ) {
      this.pageVehiculo += direction;
      this.loadVehiculo(this.pageVehiculo, this.limitVehiculo);
      return;
    }

    if (
      this.pageMobiliario + direction > 0 &&
      this.pageMobiliario + direction <= this.lastPageMobiliario &&
      this.selectedSegment === 'mobiliario'
    ) {
      this.pageMobiliario += direction;
      this.loadMuebles(this.pageMobiliario, this.limitMobiliario);
      return;
    }

    if (
      this.pageInmobiliario + direction > 0 &&
      this.pageInmobiliario + direction <= this.lastPageInmobiliario &&
      this.selectedSegment === 'inmobiliario'
    ) {
      this.pageInmobiliario += direction;
      this.loadInmobiliario(this.pageInmobiliario, this.limitInmobiliario);
      return;
    }

    if (
      this.pageDependencias + direction > 0 &&
      this.pageDependencias + direction <= this.lastPageDependencias &&
      this.selectedSegment === 'dependencias'
    ) {
      this.pageDependencias += direction;
      this.loadDependencias(this.pageDependencias, this.limitDependencias);
      return;
    }
    if (
      this.pageDirecciones + direction > 0 &&
      this.pageDirecciones + direction <= this.lastPageDirecciones &&
      this.selectedSegment === 'direcciones'
    ) {
      this.pageDirecciones += direction;
      this.loadDirecciones(this.pageDirecciones, this.limitDirecciones);
      return;
    }
  }

  /*Ion-Segment*/
  segmentChanged(event: any): void {
    this.selectedSegment = event.detail.value;
    this.filterItems();
  }

  // Método para manejar los filtros de estado
  applyStatusFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.filterItems();
  }

  filterSearchSindicaturaItems(event?: any): void {
    const searchTerm = event?.target.value.toLowerCase() || '';

    switch (this.selectedSegment) {
      case 'vehiculos':
        this.filteredCars = this.vehiculo.filter((vehiculo) => {
          return (
            vehiculo.responsibleName?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.dependencyName?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.unitAdministrative?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.unitNumber?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.responsibleUser?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.dependence?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.administrativeUnit?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.brand?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.class?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.model?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.licensePlates?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.color?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.serialNumber?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.location?.toLowerCase().includes(searchTerm) ||
            '' ||
            vehiculo.observations?.toLowerCase().includes(searchTerm)
          );
        });
        break;
      case 'mobiliario':
        this.filteredFurniture = this.mobiliario.filter((mueble) => {
          return (
            mueble.responsibleName?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.dependencyName?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.unitAdministrative?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.responsibleUser?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.dependence?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.administrativeUnit?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.propertyKey?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.descriptionBrand?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.type?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.color?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.actualState?.toLowerCase().includes(searchTerm) ||
            '' ||
            mueble.observations?.toLowerCase().includes(searchTerm)
          );
        });
        break;
      case 'inmobiliario':
        this.filteredTerrain = this.inmobiliario.filter((inmueble) => {
          return (
            inmueble.folio?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.description?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.type?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.location?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.cadastralKey?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.status?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.pubPropReg?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.lastAppraisalDate?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.land?.toLowerCase().includes(searchTerm) ||
            '' ||
            inmueble.construction?.toLowerCase().includes(searchTerm)
          );
        });
        break;
      case 'dependencias':
        this.filteredDependencies = this.dependencias.filter((dependencia) => {
          return (
            dependencia.name?.toLowerCase().includes(searchTerm) ||
            '' ||
            dependencia.code?.toLowerCase().includes(searchTerm)
          );
        });
        break;
      case 'direcciones':
        this.filteredDirections = this.direcciones.filter((direccion) => {
          return (
            direccion.name?.toLowerCase().includes(searchTerm) ||
            '' ||
            direccion.code?.toLowerCase().includes(searchTerm)
          );
        });
        break;
      default:
        console.error('Segmento no reconocido');
        break;
    }
    this.checkIfDataExists();
  }

  private filterItems() {
    switch (this.selectedSegment) {
      case 'vehiculos':
        this.filterCars();
        break;
      case 'mobiliario':
        this.filterFurniture();
        break;
      case 'inmobiliario':
        this.filterTerrain();
        break;
      case 'dependencias':
        this.filterDependencies();
        break;
      case 'direcciones':
        this.filterDirection();
        break;
      default:
        break;
    }
    this.checkIfDataExists();
  }

  private filterCars() {
    this.filteredCars = this.vehiculo.filter((vehiculo) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && vehiculo.isActive) ||
        (this.filterStatus === 'inactive' && !vehiculo.isActive);
      return statusMatch;
    });
  }

  private filterFurniture() {
    this.filteredFurniture = this.mobiliario.filter((mobiliario) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && mobiliario.state) ||
        (this.filterStatus === 'inactive' && !mobiliario.state);
      return statusMatch;
    });
  }

  private filterTerrain() {
    this.filteredTerrain = this.inmobiliario.filter((inmobiliario) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && inmobiliario.isActive) ||
        (this.filterStatus === 'inactive' && !inmobiliario.isActive);
      return statusMatch;
    });
  }

  private filterDependencies() {
    this.filteredDependencies = this.dependencias.filter((dependencias) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && dependencias.state) ||
        (this.filterStatus === 'inactive' && !dependencias.state);
      return statusMatch;
    });
  }

  private filterDirection() {
    this.filteredDirections = this.direcciones.filter((direcciones) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && direcciones.state) ||
        (this.filterStatus === 'inactive' && !direcciones.state);
      return statusMatch;
    });
  }

  //Métodos para llamar APIs
  private loadVehiculo(page: number, limit: number) {
    // Llamada a la API para obtener los vehículos con paginación
    this.sindicaturaService.getVehiculo(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.vehiculo = data.data.map((vehiculo) => {
          // Verifica si los campos están vacíos y establece 'N/A' en su lugar
          vehiculo.responsibleName = vehiculo.responsibleName || 'N/A';
          vehiculo.unitAdministrative = vehiculo.unitAdministrative || 'N/A';
          vehiculo.dependencyName = vehiculo.dependencyName || 'N/A';
          return vehiculo;
        });
        this.pageVehiculo = data.meta.page;
        this.lastPageVehiculo = data.meta.lastPage;
        this.filterCars();
        this.checkIfDataExists();
      },
      (error) => {
        console.error('Error al obtener vehiculos', error);
        console.error(
          `Error al obtener el usuario para el vehículo  ${
            error?._id || 'desconocido'
          }`
        );
      }
    );
  }

  // Método para ordenar la tabla de vehiculos
  sortCarsTable(property: string, columnIndex: number) {
    this.sortSindicatura[columnIndex] =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 1
        : -1;

    this.filteredCars.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
    // Reinicia los otros íconos a su estado predeterminado
    this.sortSindicatura = this.sortSindicatura.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Método para ordenar la tabla de bienes muebles
  sortFunitureTable(property: string, columnIndex: number) {
    this.sortSindicatura[columnIndex] =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 1
        : -1;

    this.filteredFurniture.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
    // Reinicia los otros íconos a su estado predeterminado
    this.sortSindicatura = this.sortSindicatura.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Método para ordenar la tabla de bienes muebles
  sortTerrainTable(property: string, columnIndex: number) {
    this.sortSindicatura[columnIndex] =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 1
        : -1;

    this.filteredTerrain.sort((a, b) => {
      const aValue = this.getNestedProperty(a, property);
      const bValue = this.getNestedProperty(b, property);

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.toLowerCase() < bValue.toLowerCase()
          ? -1 * direction
          : aValue.toLowerCase() > bValue.toLowerCase()
          ? 1 * direction
          : 0;
      }

      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * direction;
    });

    // Reinicia los otros íconos a su estado predeterminado
    this.sortSindicatura = this.sortSindicatura.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Función auxiliar para acceder a propiedades anidadas
  getNestedProperty(obj: any, property: string) {
    return property.split('.').reduce((o, key) => (o || {})[key], obj);
  }

  // Método para ordenar la tabla de dependencias
  sortDependencyTable(property: string, columnIndex: number) {
    this.sortSindicatura[columnIndex] =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 1
        : -1;

    this.filteredDependencies.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
    // Reinicia los otros íconos a su estado predeterminado
    this.sortSindicatura = this.sortSindicatura.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  // Método para ordenar la tabla de direction
  sortDirectionTable(property: string, columnIndex: number) {
    this.sortSindicatura[columnIndex] =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 'caret-up-circle-outline'
        : 'caret-down-circle-outline';

    const direction =
      this.sortSindicatura[columnIndex] === 'caret-down-circle-outline'
        ? 1
        : -1;

    this.filteredDirections.sort((a, b) => {
      if (a[property].toLowerCase() < b[property].toLowerCase()) {
        return -1 * direction;
      } else if (a[property].toLowerCase() > b[property].toLowerCase()) {
        return 1 * direction;
      } else {
        return 0;
      }
    });
    // Reinicia los otros íconos a su estado predeterminado
    this.sortSindicatura = this.sortSindicatura.map((icon, index) => {
      return index === columnIndex ? icon : 'caret-down-circle-outline';
    });
  }

  private loadMuebles(page: number, limit: number) {
    // Llamada a la API para obtener los vehículos con paginación
    this.sindicaturaService.getMuebles(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.mobiliario = data.data.map((mobiliario) => {
          // Verifica si los campos están vacíos y establece 'N/A' en su lugar
          mobiliario.responsibleName = mobiliario.responsibleName || 'N/A';
          mobiliario.unitAdministrative =
            mobiliario.unitAdministrative || 'N/A';
          mobiliario.dependencyName = mobiliario.dependencyName || 'N/A';
          return mobiliario;
        });
        this.pageMobiliario = data.meta.page;
        this.lastPageMobiliario = data.meta.lastPage;
        this.filterFurniture();
        this.checkIfDataExists();
      },
      (error) => {
        console.error('Error al obtener muebles', error);
        console.error(
          `Error al obtener el usuario para el mueble ${
            error?._id || 'desconocido'
          }`
        );
      }
    );
  }

  private loadInmobiliario(page: number, limit: number) {
    this.sindicaturaService.getInmobiliario(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.inmobiliario = data.data;
        this.pageInmobiliario = data.meta.page;
        this.lastPageInmobiliario = data.meta.lastPage;
        this.filterTerrain();
        this.checkIfDataExists();
      },
      (error) => {
        console.error('Error al obtener inmobiliario', error);
      }
    );
  }

  private loadDependencias(page: number, limit: number) {
    this.sindicaturaService.getDependencias(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.dependencias = data.data;
        this.pageDependencias = data.meta.page;
        this.lastPageDependencias = data.meta.lastPage;
        this.filterDependencies();
        this.checkIfDataExists();
      },
      (error) => {
        console.error('Error al obtener dependencias', error);
      }
    );
  }

  private loadDirecciones(page: number, limit: number) {
    this.sindicaturaService.getDirecciones(page, limit).subscribe(
      (data) => {
        this.isLoading = false;
        this.direcciones = data.data;
        this.pageDirecciones = data.meta.page;
        this.lastPageDirecciones = data.meta.lastPage;
        this.filterDirection();
        this.checkIfDataExists();
      },
      (error) => {
        console.error('Error al obtener direcciones', error);
      }
    );
  }

  /*EDICION DE DATOS*/
  async editarVehiculo(vehiculo: any) {
    const modal = await this.modalController.create({
      component: ModalVehiculoComponent,
      componentProps: {
        vehiculo: vehiculo,
      },
    });
    return await modal.present();
  }

  async editarMueble(mueble: any) {
    const modal = await this.modalController.create({
      component: ModalMueblesComponent,
      componentProps: {
        mueble: mueble,
      },
    });
    return await modal.present();
  }
  async editarInmueble(inmueble: any) {
    const modal = await this.modalController.create({
      component: ModalInmueblesComponent,
      componentProps: {
        inmueble: inmueble,
      },
    });
    return await modal.present();
  }

  /*Borrados logicos*/
  deleteMueble(_id: string) {
    // Llamar al método deleteMueble del servicio para eliminar el mueble
    this.sindicaturaService.deleteMuebles(_id).subscribe(
      (response) => {
        console.log('Mueble eliminado exitosamente:', response);
        // Aquí podrías actualizar la lista de muebles o tomar otras acciones necesarias
        this.loadMuebles(this.pageMobiliario, this.limitMobiliario);
      },
      (error) => {
        console.error('Error al eliminar el mueble:', error);
        // Manejar el error de acuerdo a tus necesidades
      }
    );
  }

  deleteVehiculo(_id: string) {
    // Llamar al método deleteMueble del servicio para eliminar el vehiculo
    this.sindicaturaService.deleteVehiculos(_id).subscribe(
      (response) => {
        console.log('Vehiculo eliminado exitosamente:', response);
        // Aquí podrías actualizar la lista de muebles o tomar otras acciones necesarias
        this.loadVehiculo(this.pageVehiculo, this.limitVehiculo);
      },
      (error) => {
        console.error('Error al eliminar el vehiculo:', error);
        // Manejar el error de acuerdo a tus necesidades
      }
    );
  }

  deleteDependencia(_id: string) {
    this.sindicaturaService.deleteDependencia(_id).subscribe(
      (response) => {
        console.log('Dependencia eliminada exitosamente', response);
        this.loadDependencias(this.pageDependencias, this.limitDependencias);
      },
      (error) => {
        console.error('Error al eliminar dependencia', error);
      }
    );
  }
  deleteDireccion(_id: string) {
    this.sindicaturaService.deleteDireccion(_id).subscribe(
      (response) => {
        console.log('Direccion eliminada exitosamente', response);
        this.loadDirecciones(this.pageDirecciones, this.limitDirecciones);
      },
      (error) => {
        console.error('Error al eliminar direccion', error);
      }
    );
  }
  /*--------------------------------------------------------------------------*/
  // Método para obtener el nombre de la dependencia por su ID
  getDependenciaName(dependencyId: string): string {
    const dependencia = this.dependencias.find(
      (dep) => dep._id === dependencyId
    );
    return dependencia ? dependencia.name : 'N/A';
  }

  /*--------------------------------------------------------------------------*/
  async deleteCars(vehiculo: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el auto ${vehiculo.brand} ${vehiculo.model}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.sindicaturaService
              .deleteVehiculos(vehiculo._id)
              .subscribe(() => {
                this.vehiculo = this.vehiculo.filter(
                  (v) => v._id !== vehiculo._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }
  async deleteFurniture(mobiliario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el mueble ${mobiliario.descriptionBrand}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.sindicaturaService
              .deleteMuebles(mobiliario._id)
              .subscribe(() => {
                this.mobiliario = this.mobiliario.filter(
                  (m) => m._id !== mobiliario._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }
  async deleteProperties(inmobiliario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la propiedad ${inmobiliario.description}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.sindicaturaService
              .deleteInmuebles(inmobiliario._id)
              .subscribe(() => {
                this.inmobiliario = this.inmobiliario.filter(
                  (m) => m._id !== inmobiliario._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }
  async deleteDependency(dependencia: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la dependencia ${dependencia.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.sindicaturaService
              .deleteDependencia(dependencia._id)
              .subscribe(() => {
                this.dependencias = this.dependencias.filter(
                  (d) => d._id !== dependencia._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }
  async deleteDirection(direccion: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la direccion ${direccion.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.sindicaturaService
              .deleteDireccion(direccion._id)
              .subscribe(() => {
                this.direcciones = this.direcciones.filter(
                  (d) => d._id !== direccion._id
                );
                this.filterItems();
              });
          },
        },
      ],
    });
    await alert.present();
  }
  /*-------------------------------------------------------------------*/
  async assignCars(carsId: string) {
    const modal = await this.modalController.create({
      component: ModalAssignCarsComponent,
      componentProps: { carsId: carsId },
    });

    return await modal.present();
  }
  async assignMubles(mueblesId: string) {
    const modal = await this.modalController.create({
      component: ModalAssignMuebleComponent,
      componentProps: { mueblesId: mueblesId },
    });

    return await modal.present();
  }
  /*----------------------------EXPORTAR A EXCEL----------------------------*/
  exportExcelSindicatura() {
    const segmentName =
      this.selectedSegment === 'vehiculos'
        ? 'vehiculos'
        : this.selectedSegment === 'mobiliario'
        ? 'mobiliario'
        : this.selectedSegment === 'inmobiliario'
        ? 'inmobiliario'
        : this.selectedSegment === 'dependencias'
        ? 'dependencias'
        : 'direcciones';

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
            this.sindicaturaService.exportTableToExcel(tableId, fileName);
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
