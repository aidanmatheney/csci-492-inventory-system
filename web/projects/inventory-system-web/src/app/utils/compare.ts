import deepEqualsCore from 'fast-deep-equal';

export const deepEquals: <T>(value1: T, value2: T) => boolean = deepEqualsCore;
