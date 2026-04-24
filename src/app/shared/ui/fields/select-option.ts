export interface AppSelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}
