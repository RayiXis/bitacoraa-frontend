import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { BitacoraService } from 'src/app/bitacora/services/bitacora.service';
import { CatalogosService } from 'src/app/services/catalogos/catalogos.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-modal-importar-equipos',
  templateUrl: './modal-importar-equipos.component.html',
  styleUrls: ['./modal-importar-equipos.component.scss'],
})
export class ModalImportarEquiposComponent  implements OnInit {

  public txtDefault: any = 'Cargar Archivo';
  private docNames: string[] = [];
  public users?: any[];
  public selectedUser: any;
  public filteredUsers?: any[];
  public isUserSelected: boolean = false;
  public isProgressVisible = false;

  @ViewChild('fileInput') fileInput: any;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private catalagoService: CatalogosService,
    private bitacoraService: BitacoraService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.bitacoraService.getDirectors(1, 1000).subscribe((users) => {
      console.log(users);
      this.users = users.data;
      this.filteredUsers = this.users;
    });
  }

  inputDocument() {
    if (!this.fileInput) {
      console.error('Elemento fileInput no está definido.');
      return;
    }

    this.fileInput.nativeElement.click();
    const file = document.querySelector<HTMLInputElement>('#file');

    file?.addEventListener('change', (e) => {
      const fileInput = document.querySelector<HTMLInputElement>('#file');

      if (fileInput?.files) {
        const files = Array.from(fileInput.files);
        this.docNames = files.map((file) => file.name);
        if (files.length === 1) {
          this.txtDefault = files[0].name;
        } else if (files.length > 1) {
          this.txtDefault = this.docNames.join(', ');
        }
      }
    });
  }

  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  selectUser(usuario: any) {
    this.selectedUser = usuario;
    this.isUserSelected = true;
    this.modalController.dismiss();
  }

  async importDoc() {
    this.isProgressVisible = true;
    const fileInput = this.fileInput.nativeElement;
    const selectedFile = fileInput.files[0];

    if (selectedFile && this.selectedUser) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Asume que el primer sheet es el que contiene los datos
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Obtiene los datos del archivo como un array de objetos
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        let completedRequests = 0;
        const totalRequests = rows.length;

        for (const row of rows) {
          // Crear un FormData para cada fila, comprobando si cada valor está definido
          const formData = new FormData();
          formData.append('sindicatura_Inventory_Code', row['Número de Inventario'] ? row['Número de Inventario'] : 'N/A');
          formData.append('description', row['Descripción'] ? row['Descripción'] : 'N/A');
          formData.append('assigned_ip', row['IP Asignada'] ? row['IP Asignada'] : 'N/A');
          formData.append('type', row['Tipo'] ? row['Tipo'] : 'N/A');
          formData.append('directionEthernet', row['Dirección Ethernet'] ? row['Dirección Ethernet'] : 'N/A');
          formData.append('hdd', row['Discos Duros'] ? row['Discos Duros'] : 'N/A');
          formData.append('address', row['Ubicación-Resguardo'] ? row['Ubicación-Resguardo'] : 'N/A');
          formData.append('userId', this.selectedUser.userId);

          // Llamar al servicio para dar de alta el equipo
          this.catalagoService.darAltaEquipo(formData).subscribe(
            (res) => {
              completedRequests++;
              if (completedRequests === totalRequests) {
                this.isProgressVisible = false;
                this.alert('Importación de Equipos', 'Se ha generado la importación de equipos exitosamente', [
                  {
                    text: 'Aceptar',
                    role: 'confirm',
                    handler: () => {
                      this.modalController.dismiss();
                    },
                  },
                ]);
              }
            },
            (err) => {
              this.alert('Importación de Equipos', 'No se ha podido generar la importación de equipo. Intentarlo más tarde.');
              console.error(err);
            }
          );
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } else {
      this.alert('Importación de Equipos', 'Deben de llenarse todos los campos');
      this.isProgressVisible = false;
    }
  }



  async cancelSolicitud() {
    this.alert('Importación de Equipos', '¿Seguro que desea cancelar la importación?', [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: () => {
          this.modalController.dismiss();
        },
      },
    ])
  }

  async alert( header: string, message: string, buttons: any[] = ['Aceptar'] ){
    const alert = await this.alertController.create({
      backdropDismiss: false,
      header: header,
      message: message,
      buttons: buttons,
    });
    await alert.present();
  }

}
