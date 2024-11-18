import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-direcciones',
  templateUrl: './modal-direcciones.page.html',
  styleUrls: ['./modal-direcciones.page.scss'],
})
export class ModalDireccionesPage implements OnInit {

  @Input() name!: string;
  @Input() direcciones!: any[];

  constructor(protected modalController: ModalController) { }

  ngOnInit() {
    console.log('modal direcciones page');
  }

}
