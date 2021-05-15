import {Nominal} from '../utils/type';

const IsoDateString = Symbol();
export type IsoDateString = Nominal<string, typeof IsoDateString>;
