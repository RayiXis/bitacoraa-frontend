import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-modal-puesto',
  templateUrl: './modal-puesto.component.html',
  styleUrls: ['./modal-puesto.component.scss'],
})
export class ModalPuestoComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  cancel() {
    this.modalCtrl.dismiss(); 
  }
}
