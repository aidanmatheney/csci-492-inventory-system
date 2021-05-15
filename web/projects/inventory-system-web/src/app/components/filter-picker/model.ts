import {ValueOf} from '../../utils/type';

type String = 'string';

type Enum = 'enum';

type Bool = 'bool';

type Int = 'int';
type UInt = 'uint';
type Float = 'float';
type UFloat = 'ufloat';
type Money = 'money';
type Date_ = 'date';
type Number = Int | UInt | Float | UFloat | Money | Date_;

export type DataType = (
  | String
  | Enum
  | Bool
  | Number
);

export type RangeFilterFormValue<T> = (
  | null
  | {min: null; max: T;}
  | {min: T; max: null;}
  | {min: T; max: T;}
);

export interface EnumOption {
  readonly label: string;
  readonly value: string;
}

type FilterTypes<TDataType extends DataType, TFormValue, TArguments = never> = Record<TDataType, {
  FormValue: TFormValue;
  Arguments: TArguments;
}>;
type FilterTypesByName = {
  contains: FilterTypes<String, string | null>;
  equalsOne: (
    & FilterTypes<Enum, string | null>
    & FilterTypes<Bool, boolean | null>
    & FilterTypes<Int | UInt | Float | UFloat | Money, number | null>
    & FilterTypes<Date_, Date | null>
  );
  equalsAny: FilterTypes<Enum, [string, ...string[]] | null, {
    options: EnumOption[];
  }>;
  min: (
    & FilterTypes<Enum, string | null, {
      options: EnumOption[];
    }>
    & FilterTypes<Int | UInt | Float | UFloat | Money, number | null>
    & FilterTypes<Date_, Date | null>
  );
  max: (
    & FilterTypes<Enum, string | null, {
      options: EnumOption[];
    }>
    & FilterTypes<Int | UInt | Float | UFloat | Money, number | null>
    & FilterTypes<Date_, Date | null>
  );
  range: (
    & FilterTypes<Enum, RangeFilterFormValue<string>, {
      options: EnumOption[];
    }>
    & FilterTypes<Int | UInt | Float | UFloat | Money, RangeFilterFormValue<number>>
    & FilterTypes<Date_, RangeFilterFormValue<Date>>
  );
};

export type FilterName = keyof FilterTypesByName;

export type DataTypeByFilterName<TFilterName extends FilterName> = keyof FilterTypesByName[TFilterName];

export type FormValueByFilterName<
  TFilterName extends FilterName
> = ValueOf<FilterTypesByName[TFilterName]> extends {FormValue: infer TFormValue;} ? TFormValue : never;
export type FormValueByFilterNameAndDataType<
  TFilterName extends FilterName,
  TDataType extends DataTypeByFilterName<TFilterName>
> = FilterTypesByName[TFilterName][TDataType] extends {FormValue: infer TFormValue;} ? TFormValue : never;

export type ArgumentsByFilterNameAndDataType<
  TFilterName extends FilterName,
  TDataType extends DataTypeByFilterName<TFilterName>
> = FilterTypesByName[TFilterName][TDataType] extends {Arguments: infer TArguments;} ? TArguments : never;
