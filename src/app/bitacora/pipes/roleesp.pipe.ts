import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleesp',
})
export class RoleespPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Admin':
        return 'Administrador';
      case 'Receivership':
        return 'Sindicatura';
      case 'Technical':
        return 'Técnico';
      case 'Employee':
        return 'Empleado';
      default:
        return value;
    }
  }
}
