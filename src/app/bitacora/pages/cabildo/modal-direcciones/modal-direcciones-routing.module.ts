import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalDireccionesPage } from './modal-direcciones.page';

const routes: Routes = [
  {
    path: '',
    component: ModalDireccionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalDireccionesPageRoutingModule {}
