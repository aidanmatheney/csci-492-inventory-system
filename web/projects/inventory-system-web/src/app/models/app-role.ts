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
