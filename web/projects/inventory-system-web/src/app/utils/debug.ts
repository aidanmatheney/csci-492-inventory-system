import {tap} from 'rxjs/operators';

export const tapLog = <V>(
  category: string,
  location: 'log' | 'warn' | 'error' = 'error'
) => tap((value: V) => console[location](`${category}:`, value));

export const tapDebugger = <V>() => tap((value: V) => {
  debugger;
});

export const objectId = (() => {
  const idByObject = new Map<object, number>();
  let nextId = 0;

  return (obj: object) => {
    let id = idByObject.get(obj);
    if (id == null) {
      id = nextId;
      nextId += 1;
      idByObject.set(obj, id);
    }
    return id;
  };
})();
