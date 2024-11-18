import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    console.log('token', token);
    if (token) {
      // Si el token existe, redirige al usuario a la página de inicio
      this.router.navigate(['/bitacora/inicio']);
      return false; // No permite el acceso a la página de login
    }
    return true; // Permite el acceso a la página de login
  }
}
