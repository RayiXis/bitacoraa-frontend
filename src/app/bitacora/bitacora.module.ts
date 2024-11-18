import { CommonModule, DatePipe } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { BitacoraPageComponent } from './pages/bitacora-page/bitacora-page.component';
import { BitacoraRoutingModule } from './bitacora-routing.module';
import { BitacoraService } from './services/bitacora.service';
import { CatalogoPageComponent } from './pages/catalogo-page/catalogo-page.component';
import { InicioPageComponent } from './pages/inicio-page/inicio-page.component';
import { InvitePageComponent } from './pages/invite-page/invite-page.component';
import { MenuLayoutComponent } from './pages/menu-layout/menu-layout.component';
import { LocalTimePipe } from './pipes/localTime.pipe';
import {
  ModalLevantarTicketComponent,
  ModalSolicitarEquipoComponent,
  ModalChatComponent,
  ModalModificarTicketComponent,
  ModalAccesoriosComponent,
} from '../components/index';
import { ServiciosPageComponent } from './pages/servicios-page/servicios-page.component';
import { SindicaturaPageComponent } from './pages/sindicatura-page/sindicatura-page.component';
import { TecnicosPageComponent } from './pages/tecnicos-page/tecnicos-page.component';
import { TicketStatusPipe } from './pipes/ticketStatus.pipe';
import { TokeninterceptorService } from '../services/tokeninterceptor/tokeninterceptor.service';
import { UserPageComponent } from './pages/user-page/user-page.component';

// import function to register Swiper custom elements
import { register } from 'swiper/element';
import { ComodatoStatusPipe } from './pipes/comodato-status.pipe';
import { ModalAssignDeviceComponent } from '../components/modal-assign-device/modal-assign-device.component';
import { ModalAssignPeripheralComponent } from '../components/modal-assign-peripheral/modal-assign-peripheral.component';
import { ModalAssignCarsComponent } from '../components/modal-assign-cars/modal-assign-cars.component';
import { ModalAssignMuebleComponent } from '../components/modal-assign-mueble/modal-assign-mueble.component';
import { MovimientosPageComponent } from './pages/movimientos-page/movimientos-page.component';
import { PermisosComponent } from '../components/permisos/permisos.component';
import { RoleespPipe } from './pipes/roleesp.pipe';
import { ReturnComodatoComponent } from '../components/return-comodato/return-comodato.component';
import { ModalImportarEquiposComponent } from '../components/modal-importar-equipos/modal-importar-equipos.component';

// register Swiper custom elements
register();

@NgModule({
  declarations: [
    BitacoraPageComponent,
    CatalogoPageComponent,
    InicioPageComponent,
    InvitePageComponent,
    ModalAssignDeviceComponent,
    ModalImportarEquiposComponent,
    ModalAssignPeripheralComponent,
    ModalAssignCarsComponent,
    ModalAssignMuebleComponent,
    MenuLayoutComponent,
    MenuLayoutComponent,
    ModalAccesoriosComponent,
    ModalChatComponent,
    ModalLevantarTicketComponent,
    ModalModificarTicketComponent,
    ModalSolicitarEquipoComponent,
    MovimientosPageComponent,
    PermisosComponent,
    ServiciosPageComponent,
    SindicaturaPageComponent,
    TecnicosPageComponent,
    UserPageComponent,
    ReturnComodatoComponent,

    // PIPES
    TicketStatusPipe,
    LocalTimePipe,
    ComodatoStatusPipe,
    RoleespPipe,
  ],
  imports: [
    BitacoraRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,
  ],

  providers: [TokeninterceptorService, BitacoraService, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  exports: [ComodatoStatusPipe],
})
export class BitacoraModule {}
