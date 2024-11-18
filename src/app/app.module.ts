import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ModalPuestoComponent } from './components/modal-dependencias/modal-dependencias.component';
import { ModalDireccionesComponent } from './components/modal-direcciones/modal-direcciones.component';
import { ModalTecnicosComponent } from './components/modal-tecnicos/modal-tecnicos.component';
import { ModalVehiculoComponent } from './components/modal-vehiculo/modal-vehiculo.component';
import { TokeninterceptorService } from './services/tokeninterceptor/tokeninterceptor.service';
import { ModalMueblesComponent } from './components/modal-muebles/modal-muebles.component';
import { ModalInmueblesComponent } from './components/modal-inmuebles/modal-inmuebles.component';
import {
  AltasBajasComponent,
  ComodatoTraspasoComponent,
  ModalEquipoComponent,
} from './components';
import { PerifericosComponent } from './components/perifericos/perifericos.component';
import { ActualizarComponent } from './components/actualizar/actualizar.component';

//SWIPER
import { register } from 'swiper/element/bundle';

register();

@NgModule({
  declarations: [
    AppComponent,
    ModalPuestoComponent,
    ModalDireccionesComponent,
    ModalTecnicosComponent,
    ModalVehiculoComponent,
    ModalMueblesComponent,
    ModalInmueblesComponent,
    ModalEquipoComponent,
    ComodatoTraspasoComponent,
    AltasBajasComponent,
    PerifericosComponent,
    ActualizarComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BitacoraModule,
    AuthModule,
    HttpClientModule,
    RouterModule.forRoot([]),
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokeninterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports: [PerifericosComponent],
})
export class AppModule {}
