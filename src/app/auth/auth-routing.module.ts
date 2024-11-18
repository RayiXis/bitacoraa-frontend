import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPage } from './pages/login/login.page';
import { PasschangePage } from './pages/passchange/passchange.page';
import { ResetpassPage } from './pages/resetpass/resetpass.page';
import { SignupPage } from './pages/signup/signup.page';
import { SignupGuard } from '../core/guards/signup/signup.guard';
import { RestorePasswordGuard } from '../core/guards/restore-password/restore-password.guard';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'login', component: LoginPage, canActivate: [AuthGuard] },
      {
        path: 'passchange',
        component: PasschangePage,
        // canActivate: [RestorePasswordGuard],
      },
      { path: 'resetpass', component: ResetpassPage },
      { path: 'signup', component: SignupPage, canActivate: [SignupGuard] },
      { path: '**', redirectTo: 'login' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
