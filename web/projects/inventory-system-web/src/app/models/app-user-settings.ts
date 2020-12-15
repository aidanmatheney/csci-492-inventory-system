export enum AppTheme {
  light = 'Light',
  dark = 'Dark'
}

export interface CurrentAppUserSettingsDto {
  theme: AppTheme;
}

export interface CurrentAppUserSettings {
  theme: AppTheme;
}
