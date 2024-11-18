import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comodatoStatus',
})
export class ComodatoStatusPipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 0:
        return 'status-pending';
      case 1:
        return 'status-in-progress';
      case 2:
        return 'status-completed';
      default:
        return '';
    }
  }
}
