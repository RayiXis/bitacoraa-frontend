import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalDireccionesPageRoutingModule } from './modal-direcciones-routing.module';

import { ModalDireccionesPage } from './modal-direcciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalDireccionesPageRoutingModule
  ],
  declarations: [ModalDireccionesPage]
})
export class ModalDireccionesPageModule {}
