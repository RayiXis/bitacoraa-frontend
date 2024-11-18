export interface Equipos {
  _id:                        string;
  userId:                     string;
  sindicatura_Inventory_Code: string;
  photos:                     any[];
  assigned_ip:                string;
  type:                       string;
  description:                string;
  directionEthernet:          string;
  hdd:                        string;
  state:                      boolean;
  available:                  boolean;
  createdAt:                  Date;
  updatedAt:                  Date;
}
