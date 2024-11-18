import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BitacoraService } from '../../services/bitacora.service';
import { UserEmployee, UserTechnical } from '../../interfaces/Bitacora';
import { CatalogoPageComponent } from '../catalogo-page/catalogo-page.component';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-menu-layout',
  templateUrl: './menu-layout.component.html',
  styleUrls: ['./menu-layout.component.scss'],
})
export class MenuLayoutComponent implements OnInit {

  public datosUsuario: UserEmployee | UserTechnical | null = null;
  public userRole: string | null = null;
  public isLargeScreen: boolean = false;

  constructor(
    private router: Router,
    private bitacoraService: BitacoraService
  ) {}

  ngOnInit(): void {
    this.bitacoraService.currentEmployee().subscribe((dataUser) => {
      this.datosUsuario = dataUser;
      this.extractUserRole();
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  extractUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userRole = decodedToken.Role;
      } catch (error) {
        console.error('Error decodificando el token', error);
      }
    } else {
      console.warn('No se encontró el token');
    }
  }

  hasRole(...roles: string[]): boolean {

    if (this.userRole) {
      return roles.includes(this.userRole);
    } else {
      return false;
    }
  }
}
