import {PartialRecordSet} from '../utils/record';

import {AppRole} from './app-role';

export interface CurrentAppUserDto {
  id: string;
  email: string;
  name: string;
  appRoles: AppRole[];
}
export interface CurrentAppUser {
  id: string;
  email: string;
  name: string;
  hasAppRoleByName: PartialRecordSet<AppRole>;
}

export interface OtherAppUserDto {
  id: string;
  email: string;
  name: string;
  emailConfirmed: boolean;
  hasPassword: boolean;
  lockedOut: boolean;
  appRoles: AppRole[];
}
export interface OtherAppUser {
  id: string;
  email: string;
  name: string;
  emailConfirmed: boolean;
  hasPassword: boolean;
  lockedOut: boolean;
  hasAppRoleByName: PartialRecordSet<AppRole>;
}
