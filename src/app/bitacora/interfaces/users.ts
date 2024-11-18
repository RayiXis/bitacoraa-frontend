export interface Users {
  _id: string;
  username: string;
  password: string;
  type: Type;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  resetToken?: string;
  email?: string;
}

export enum Type {
  Employee = 'Employee',
  Technical = 'Technical',
}
