import { Users } from 'src/app/bitacora/interfaces/users';

export interface Tecnico extends Users {
  active: boolean;
  userId?: string;
  name?: string;
  lastname?: string;
  phone?: string;
  services?: string[];
}
