import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { PasschangePage } from './pages/passchange/passchange.page'
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { ModalEquipoComponent } from '../components/modal-equipo/modal-equipo.component';

import { TokeninterceptorService } from '../services/tokeninterceptor/tokeninterceptor.service';
import { LoginPage } from './pages/login/login.page';
import { ResetpassPage } from './pages/resetpass/resetpass.page';
import { SignupPage } from './pages/signup/signup.page';

@NgModule({
  declarations: [PasschangePage, LoginPage, PasschangePage, ResetpassPage, SignupPage],
  imports: [
    AuthRoutingModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,
  ],
  providers: [TokeninterceptorService],
})
export class AuthModule {}
