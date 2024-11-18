import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CabildoPage } from './cabildo.page';

const routes: Routes = [
  {
    path: '',
    component: CabildoPage
  },
  {
    path: 'modal-cabildo',
    loadChildren: () => import('./modal-cabildo/modal-cabildo.module').then( m => m.ModalCabildoPageModule)
  },
  {
    path: 'modal-direcciones',
    loadChildren: () => import('./modal-direcciones/modal-direcciones.module').then( m => m.ModalDireccionesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CabildoPageRoutingModule {}
