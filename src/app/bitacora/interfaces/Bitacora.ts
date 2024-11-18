
export interface Bitacora {
  folio: number;
  ip: string;
  macAddress: string;
  description: string;
  problem: string;
  observation?: string;
  notes?: string;
  status: string;
  dependecie: string;
  technical: string;
}

export interface UserEmployee {
  _id:               string;
  authId:            string;
  code:              string;
  type:              string;
  job:               string;
  abt:               string;
  name:              string;
  lastname:          string;
  phone:             string;
  canRequestDevices: boolean;
  devices:           string[];
  urgencyLevel:      number;
  createdAt:         Date;
  updatedAt:         Date;
}

export interface User {
  _id:      string;
  authId:   string;
  name:     string;
  lastname: string;
  canRequestDevices: boolean;
  abt:      string;
  job:      string;
}

export interface Services {
  Id: string;
  Description: string;
  Name: string;
}

export interface Tickets {
  notes?: [
    {
      userId: string;
      note: string;
      date: Date;
    }
  ]
  _id:                string;
  folio:              string;
  userId:             string;
  userName?:           string;
  reportDetail:       string;
  photoVideo:         string[];
  dateTimeStart:      string;
  estimatedTime:      string;
  dateTimeEnd:        string;
  status:             number;
  createdAt:          Date;
  updatedAt:          Date;
  technicalId:        string;
  technicalName?:      string;
  state:              boolean;
  code:               string;
  selected?:          boolean;
}

export interface PaginationResponse {
  data:           any[];
  meta: {
    total:        number;
    page:         number;
    lastPage:     number;
  };
}

export interface Equipos {
  _id:             string;
  sindicatura_Inventory_Code: string;
  userName:        string;
  assigned_ip:     string;
  inventoryNumber: string;
  description:     string;
  directionEthernet: string;
  state:           boolean;
  ip:              string;
  hdd:             string;
  type:            string;
  location:        string;
  createdAt:       Date;
  updatedAt:       Date;
}

export interface UserTechnical {
  name:                   string;
  user_id:                string;
  authId:                 string;
  lastname:               string;
  email:                  string;
  phone:                  string;
  job:                    string;
  canRequestDevices:      boolean;
  devices:                any[];
  abt:                    string;
  code:                   string;
  administrativeUnitName: string;
  dependencyName:         string;
  role:                   string;
}



interface Vehiculo {
  unitNumber: string;
  brand: string;
  class: string;
  model: string;
  licensePlates: string;
  color: string;
  serialNumber: string;
  observations: string;
  isActive: boolean;
  selected?: boolean;
}

interface Mobiliario {
  propertyKey: string;
  descriptionBrand: string;
  serialNumber: string;
  color: string;
  actualState: string;
  invoiceNumber: string;
  observations: string;
  state: boolean;
  selected?: boolean;
}
