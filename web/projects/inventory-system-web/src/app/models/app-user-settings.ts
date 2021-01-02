export enum AppTheme {
  light = 'Light',
  dark = 'Dark'
}

export interface CurrentAppUserSettingsDto {
  theme: AppTheme | null;
}

export interface CurrentAppUserSettings {
  theme: AppTheme | undefined;
}
