export const nanToUndefined = (num: number) => Number.isNaN(num) ? undefined : num;
export const stringToNumber = (numString: string) => nanToUndefined(Number(numString));
