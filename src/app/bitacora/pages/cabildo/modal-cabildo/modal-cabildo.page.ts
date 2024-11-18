import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalDireccionesPage } from '../modal-direcciones/modal-direcciones.page';

@Component({
  selector: 'app-modal-cabildo',
  templateUrl: './modal-cabildo.page.html',
  styleUrls: ['./modal-cabildo.page.scss'],
})
export class ModalCabildoPage implements OnInit {

  @Input() name!: string;
  @Input() secretarias!: any[];
  @Input() direcciones!: any[];
  @Input() organismos!: any[];
  @Input() paramunicipales!: any[];

  constructor(protected modalController: ModalController) { }

  ngOnInit() { console.log('cabildo page') }

  async openModal(name: string, direcciones: any[]) {
    const modal = await this.modalController.create({
      component: ModalDireccionesPage,
      cssClass: 'fullscreen-modal',
      componentProps: {
        name: name,
        direcciones: direcciones,
      }
    });

    await modal.present();
  }

}
