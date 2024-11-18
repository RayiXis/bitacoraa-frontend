import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const bearerToken = localStorage.getItem('token');
  if (bearerToken) {
    return true;
  } else {
    window.location.href = '/login';
    return false;
  }
}
