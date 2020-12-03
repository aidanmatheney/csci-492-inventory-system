import {PartialRecordSet} from '../utils/record';

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

export enum AppRole {
  secretary = 'Secretary',
  administrator = 'Administrator'
}
export const appRoleRankingByName = {
  [AppRole.secretary]: 0,
  [AppRole.administrator]: 1
} as const;
export const appRoleSortCompare = (appRole1: AppRole, appRole2: AppRole) => {
  return appRoleRankingByName[appRole1] - appRoleRankingByName[appRole2];
};
