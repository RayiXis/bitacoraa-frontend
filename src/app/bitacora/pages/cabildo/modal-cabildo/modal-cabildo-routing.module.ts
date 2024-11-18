import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalCabildoPage } from './modal-cabildo.page';

const routes: Routes = [
  {
    path: '',
    component: ModalCabildoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalCabildoPageRoutingModule {}
