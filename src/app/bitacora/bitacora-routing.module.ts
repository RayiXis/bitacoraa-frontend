import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuLayoutComponent } from './pages/menu-layout/menu-layout.component';
import { InicioPageComponent } from './pages/inicio-page/inicio-page.component';
import { UserPageComponent } from './pages/user-page/user-page.component';
import { BitacoraPageComponent } from './pages/bitacora-page/bitacora-page.component';
import { SindicaturaPageComponent } from './pages/sindicatura-page/sindicatura-page.component';
import { TecnicosPageComponent } from './pages/tecnicos-page/tecnicos-page.component';
import { ServiciosPageComponent } from './pages/servicios-page/servicios-page.component';
import { InvitePageComponent } from './pages/invite-page/invite-page.component';
import { CatalogoPageComponent } from './pages/catalogo-page/catalogo-page.component';
import { BitacoraGuardGuard } from '../guards/bitacora.guard';
import { MovimientosPageComponent } from './pages/movimientos-page/movimientos-page.component';

const routes: Routes = [
  {
    path: '',
    component: MenuLayoutComponent,
    children: [
      {
        path: 'inicio',
        component: InicioPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical', 'Receivership', 'Employee'] },
      },
      {
        path: 'usuario',
        component: UserPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical', 'Receivership', 'Employee'] },
      },
      {
        path: 'bitacora',
        component: BitacoraPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical'] },
      },
      {
        path: 'sindicatura',
        component: SindicaturaPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Receivership'] },
      },
      {
        path: 'tecnicos',
        component: TecnicosPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical'] },
      },
      {
        path: 'servicios',
        component: ServiciosPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical'] },
      },
      {
        path: 'invite',
        component: InvitePageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical'] },
      },
      {
        path: 'catalogo',
        component: CatalogoPageComponent,
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical', 'Receivership'] },
      },
      {
        path: 'mis-movimientos',
        component: MovimientosPageComponent,
        data: { roles: ['Admin', 'Employee'] },
      },
      {
        path: 'cabildo',
        loadChildren: () =>
          import('./pages/cabildo/cabildo.module').then(
            (m) => m.CabildoPageModule
          ),
        canActivate: [BitacoraGuardGuard],
        data: { roles: ['Admin', 'Technical'] },
      },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BitacoraRoutingModule {}
