export interface Pdfs {
  data: any[];
  meta: Meta;
}

export interface Altas {
  _id:                string;
  folio:              string;
  userId:             string;
  equipmentId:        string;
  directedId:         string;
  freeText:           string;
  ccp:                string[];
  status:             number;
  date:               Date;
  managers:           any[];
  createdAt:          Date;
  updatedAt:          Date;
  tipoPdf:            string;
  responsibleName:    string;
  unitAdministrative: string;
  equipmentName:      string;
}

export interface Bajas {
  _id:                string;
  folio:              string;
  userId:             string;
  equipmentId:        string;
  directedId:         string;
  freeText:           string;
  ccp:                string[];
  status:             number;
  date:               Date;
  managers:           any[];
  createdAt:          Date;
  updatedAt:          Date;
  tipoPdf:            string;
  responsibleName:    string;
  unitAdministrative: string;
  equipmentName:      string;
}

export interface Traspaso {
  _id:                string;
  equipment:          Equipment;
  folio:              string;
  userId:             string;
  userRequesting:     string;
  newUserId:          string;
  equipmentId:        string;
  directedId:         string;
  freeText:           string;
  ccp:                string[];
  status:             number;
  date:               Date;
  managers:           string[];
  createdAt:          Date;
  updatedAt:          Date;
  tipoPdf:            string;
  responsibleName:    string;
  unitAdministrative: string;
  equipmentName:      string;
}

export interface  Equipment {
  newInventoryCode: string;
}


export interface Meta {
  total:    number;
  page:     number;
  lastPage: number;
}


