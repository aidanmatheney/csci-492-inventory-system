export interface AppUser {
  id: string;
  email: string;
  name: string;
}

export enum AppRole {
  secretary = 'Secretary',
  administrator = 'Administrator'
}
