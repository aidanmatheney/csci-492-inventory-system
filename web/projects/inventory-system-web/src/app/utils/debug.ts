import {tap} from 'rxjs/operators';

export const tapLog = <V>(
  category: string,
  location: 'log' | 'warn' | 'error' = 'error'
) => tap((value: V) => console[location](`${category}:`, value));

export const tapDebugger = <V>() => tap((value: V) => {
  debugger;
});
