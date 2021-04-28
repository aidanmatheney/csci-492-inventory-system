import {SortCompare} from '../utils/array';

export enum AppRole {
  student = 'Student',
  secretary = 'Secretary',
  administrator = 'Administrator'
}
export const appRoleRankingByName = {
  [AppRole.student]: 0,
  [AppRole.secretary]: 1,
  [AppRole.administrator]: 2
} as const;
export const appRoleSortCompare: SortCompare<AppRole> = (appRole1, appRole2) => {
  return appRoleRankingByName[appRole1] - appRoleRankingByName[appRole2];
};
