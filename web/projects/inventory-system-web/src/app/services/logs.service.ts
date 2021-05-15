import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, startWith} from 'rxjs/operators';

import {cacheUntil} from '../utils/observable';
import {Loadable} from '../utils/loading';
import {memoize} from '../utils/memo';
import {dynamicQueryParametersToDto} from '../utils/dynamic-query';
import {mapCaught404To} from '../utils/http';

import {Destroyed$} from './destroyed$.service';

import {environment} from '../../environments/environment';
import {WebApiLogEntry, WebApiLogEntryDto} from '../models/log';
import {DynamicQueryParameters, DynamicQueryParametersDto, DynamicQueryResult} from '../models/dynamic-query';

const webApiLogEntryFromDto = (entryDto: WebApiLogEntryDto): WebApiLogEntry => ({
  ...entryDto,
  timeWritten: new Date(entryDto.timeWritten)
});

@Injectable({providedIn: 'root'})
export class LogsService {
  private readonly baseUrl = `${environment.serverBaseUrl}/Api/Logs`;

  public constructor(
    private readonly http: HttpClient,
    private readonly destroyed$: Destroyed$
  ) { }

  public queryWebApiLogEntries(parameters: DynamicQueryParameters<WebApiLogEntry>) {
    return this.httpQueryWebApiLogEntries(dynamicQueryParametersToDto(parameters)).pipe(
      map((dtoResult): DynamicQueryResult<WebApiLogEntry> => ({
        ...dtoResult,
        records: dtoResult.records.map(webApiLogEntryFromDto)
      })),
      map(Loadable.loaded),
      startWith(Loadable.loading)
    );
  }

  public readonly selectWebApiLogEntryById = memoize((id: number) => {
    return this.httpGetWebApiLogEntry(id).pipe(
      map(webApiLogEntryFromDto),
      map(Loadable.loaded),
      startWith(Loadable.loading),
      cacheUntil(this.destroyed$),
      mapCaught404To(Loadable.loaded(undefined))
    );
  });

  private httpQueryWebApiLogEntries(parameters: DynamicQueryParametersDto<WebApiLogEntry>) {
    return this.http.post<DynamicQueryResult<WebApiLogEntryDto>>(`${this.getWebApiUrl()}/Query`, parameters);
  }

  private httpGetWebApiLogEntry(entryId: number) {
    return this.http.get<WebApiLogEntryDto>(`${this.getWebApiUrl()}/${encodeURIComponent(entryId)}`);
  }

  private getWebApiUrl() {
    return `${this.baseUrl}/WebApi`;
  }
}
