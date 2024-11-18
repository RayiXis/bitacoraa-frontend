import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController, AlertController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';

import { TecnicosService } from 'src/app/services/tecnicos/tecnicos.service';
import { ModalTecnicosComponent } from 'src/app/components/modal-tecnicos/modal-tecnicos.component';
import { BitacoraService } from '../../services/bitacora.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tecnicos-page',
  templateUrl: './tecnicos-page.component.html',
  styleUrls: ['./tecnicos-page.component.scss'],
})
export class TecnicosPageComponent implements OnInit {
  userRole: string | null = null;
  userId: string | null = null;
  tecnicos: any[] = [];
  tecnicosFiltrados: any[] = [];
  filtroSeleccionado: string = 'activos';
  public isLoading: boolean = true;

  noTechnicalData = false;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private http: HttpClient,
    private tecnicosService: TecnicosService,
    private modalController: ModalController,
    private alertController: AlertController,
    private bitacoraService: BitacoraService
  ) {}

  /*---------------------------------------------*/
  ngOnInit(): void {
    this.getTecnicosFromAPI();
    this.extractUserRole();
  }

  // Manejar el evento de búsqueda
  filterSearchTechItems(event?: any): void {
    const searchTerm = event?.target.value.toLowerCase() || '';

    this.tecnicosFiltrados = this.tecnicos.filter((tecnico) => {
      const searchMatch =
        tecnico.name?.toLowerCase().includes(searchTerm) ||
        '' ||
        tecnico.lastname?.toLowerCase().includes(searchTerm) ||
        '' ||
        tecnico.phone?.toLowerCase().includes(searchTerm) ||
        '' ||
        tecnico.email?.toLowerCase().includes(searchTerm);

      return searchMatch;
    });

    // Verificar si hay datos técnicos filtrados
    this.noTechnicalData = this.tecnicosFiltrados.length === 0;

    // Ordenar la lista alfabéticamente por apellido
    this.tecnicosFiltrados.sort((a, b) => {
      const lastnameA = a.lastname || '';
      const lastnameB = b.lastname || '';
      return lastnameA.localeCompare(lastnameB);
    });
  }

  extractUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userRole = decodedToken.Role;
        this.userId = decodedToken.Id;
      } catch (error) {
        console.error('Error decodificando el token', error);
      }
    } else {
      console.warn('No se encontró el token');
    }
  }

  hasRole(...roles: string[]): boolean {
    return this.userRole ? roles.includes(this.userRole) : false;
  }

  /*Metodos*/
  getTecnicosFromAPI() {
    this.http.get<any[]>(`${environment.apiUrl}/users/technical`).subscribe(
      (data) => {
        this.tecnicos = data;
        this.isLoading = false;
        this.filtroTecnicos();
      },
      (error) => {
        console.error('Error al obtener los técnicos:', error);
      }
    );
  }

  async eliminarTech(index: number) {
    // Verificar que el índice esté dentro de los límites
    if (index < 0 || index >= this.tecnicosFiltrados.length) {
      console.error('Índice fuera de los límites:', index);
      return;
    }

    const tecnico = this.tecnicosFiltrados[index];

    // Verificar que el técnico y el userId existan
    if (!tecnico || !tecnico.userId) {
      console.error('Técnico no válido o falta userId:', tecnico);
      return;
    }

    try {
      await lastValueFrom(this.tecnicosService.deleteTecnico(tecnico.userId));
      console.log('Técnico eliminado con éxito');

      // Actualizar la lista de técnicos localmente
      this.tecnicos = this.tecnicos.filter((t) => t.userId !== tecnico.userId);
      this.filtroTecnicos(); // Filtrar y ordenar los técnicos nuevamente

      // Mostrar IonAlert
      const alert = await this.alertController.create({
        header: 'Eliminación exitosa',
        message: 'El técnico ha sido eliminado correctamente.',
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {
              window.location.reload(); // Recargar la página
            },
          },
        ],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al eliminar técnico:', error);
    }
  }

  // Método para manejar los filtros de estado
  applyStatusFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus = status;
    this.filterItems();
  }

  private filterItems() {
    this.filterTech();
  }

  private filterTech() {
    this.tecnicosFiltrados = this.tecnicos.filter((tecnicos) => {
      const statusMatch =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && tecnicos.status === 0) ||
        (this.filterStatus === 'inactive' && tecnicos.status === 2);
      return statusMatch;
    });
    // Verificar si hay datos técnicos filtrados
    this.noTechnicalData = this.tecnicosFiltrados.length === 0;
  }

  filtroTecnicos() {
    switch (this.filtroSeleccionado) {
      case 'activos':
        this.tecnicosFiltrados = this.tecnicos.filter(
          (tecnico) => tecnico.status === 0
        );
        break;
      case 'desactivados':
        this.tecnicosFiltrados = this.tecnicos.filter(
          (tecnico) => tecnico.status === 1
        );
        break;
      case 'todos':
        this.tecnicosFiltrados = this.tecnicos;
        break;
    }
    // Ordenar la lista alfabéticamente por apellido
    this.tecnicosFiltrados.sort((a, b) => {
      const lastnameA = a.lastname || '';
      const lastnameB = b.lastname || '';
      return lastnameA.localeCompare(lastnameB);
    });
  }
  /*ION-ALERT*/
  async presentAlertConfirm(index: number) {
    const alert = await this.alertController.create({
      header: '¿Desea eliminar a este tecnico?',
      message: 'Una vez eliminado no habra vuelta atras',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Si',
          handler: () => {
            this.eliminarTech(index);
          },
        },
      ],
    });
    await alert.present();
  }
  onSubmit() {}
}
