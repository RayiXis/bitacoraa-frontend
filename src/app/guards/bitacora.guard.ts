import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokeninterceptorService } from '../services/tokeninterceptor/tokeninterceptor.service';
import { BitacoraService } from '../bitacora/services/bitacora.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class BitacoraGuardGuard implements CanActivate {
  constructor(
    private tokenInterceptorService: TokeninterceptorService,
    private bitacoraService: BitacoraService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userRole = decodedToken.Role;
        const requiredRoles = route.data['roles'] as Array<string>;
        if (requiredRoles.includes(userRole)) {
          return true;
        } else {
          this.router.navigate(['/bitacora/inicio']);
          return false;
        }
      } catch (error) {
        console.error('Error decodificando el token', error);
        this.router.navigate(['/bitacora/inicio']);
        return false;
      }
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
