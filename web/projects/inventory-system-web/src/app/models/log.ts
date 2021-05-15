import {IsoDateString} from './primitive';

export enum WebApiLogLevel {
  trace = 'Trace',
  debug = 'Debug',
  information = 'Information',
  warning = 'Warning',
  error = 'Error',
  critical = 'Critical'
}

export interface WebApiLogEntry {
  id: number;

  timeWritten: Date;
  serverName: string;

  category: string;
  scope?: string;
  logLevel: WebApiLogLevel;
  eventId: number;
  eventName?: string;
  message: string;
  exception?: string;
}
export type WebApiLogEntryDto = Omit<WebApiLogEntry, 'timeWritten'> & {
  timeWritten: IsoDateString;
};
