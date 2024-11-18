import { Component, OnInit } from '@angular/core';
import { CabildoService } from '../../services/cabildo.service';
import { ModalController } from '@ionic/angular';
import { ModalCabildoPage } from './modal-cabildo/modal-cabildo.page';

@Component({
  selector: 'app-cabildo',
  templateUrl: './cabildo.page.html',
  styleUrls: ['./cabildo.page.scss'],
})
export class CabildoPage implements OnInit {

  cabildos: any;

  constructor(private cabildoService: CabildoService, private modalController: ModalController) { }

  ngOnInit() {
    this.getCabildos();
  }

  getCabildos() {
    this.cabildoService.getCabildo().subscribe((cabildos: any) => {
      this.cabildos = cabildos;
      console.log(this.cabildos);
    });
  }

  async openModal(cabildo: any) {
    const modal = await this.modalController.create({
      component: ModalCabildoPage,
      cssClass: 'fullscreen-modal',
      componentProps: {
        name: cabildo.name,
        secretarias: cabildo.secretarias,
        direcciones: cabildo.direcciones,
        organismos: cabildo.organismos,
        paramunicipales: cabildo.paramunicipales,
      }
    });

    await modal.present();
  }

}
