import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalCabildoPageRoutingModule } from './modal-cabildo-routing.module';

import { ModalCabildoPage } from './modal-cabildo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalCabildoPageRoutingModule
  ],
  declarations: [ModalCabildoPage]
})
export class ModalCabildoPageModule {}
