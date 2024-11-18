import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'ticketStatus',
})
export class TicketStatusPipe implements PipeTransform {

  transform( value: number ): string {
    switch( value ) {
      case (0):
        return 'Pendiente'
      case 1:
        return 'Trabajando'
      case 2:
        return 'Completada'

    }
    return value.toString();
  }

}
