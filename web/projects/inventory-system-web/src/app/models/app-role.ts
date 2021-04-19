import {SortCompare} from '../utils/array';

export enum AppRole {
  secretary = 'Secretary',
  administrator = 'Administrator'
}
export const appRoleRankingByName = {
  [AppRole.secretary]: 0,
  [AppRole.administrator]: 1
} as const;
export const appRoleSortCompare: SortCompare<AppRole> = (appRole1, appRole2) => {
  return appRoleRankingByName[appRole1] - appRoleRankingByName[appRole2];
};
