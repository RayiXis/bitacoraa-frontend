import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CabildoPageRoutingModule } from './cabildo-routing.module';

import { CabildoPage } from './cabildo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CabildoPageRoutingModule,
  ],
  declarations: [CabildoPage]
})
export class CabildoPageModule {}
