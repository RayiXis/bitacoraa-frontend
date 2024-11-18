export interface Agenda {
  _id:       string;
  userId:    string;
  equipment: string;
  reason:    string;
  place:     string;
  initDate:  Date;
  endDate:   Date;
  equipmentName?: string;
  state:     number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
  code:      string;
  useHours:  number;
  userName:  string;
}

export interface Accesorio {
  _id:             string;
  inventoryNumber: string;
  description:     string;
  state:           boolean;
  ip:              string;
  type:            string;
  createdAt:       Date;
  updatedAt:       Date;
}
