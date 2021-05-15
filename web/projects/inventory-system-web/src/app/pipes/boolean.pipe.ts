import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'boolean'})
export class BooleanPipe implements PipeTransform {
  public transform(
    value: boolean | null | undefined,
    format: 'YesNo' | 'TrueFalse' = 'YesNo'
  ) {
    if (value == null) {
      return '';
    }

    if (format === 'YesNo') {
      return value ? 'Yes' : 'No';
    }
    return value ? 'True' : 'False';
  }
}
