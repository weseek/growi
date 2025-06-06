export type NonEmptyString = string & { readonly __brand: unique symbol };

export const isNonEmptyString = (value: string | null | undefined): value is NonEmptyString => {
  return value != null && value.length > 0;
};

export const toNonEmptyStringOrUndefined = (value: string | null | undefined): NonEmptyString | undefined => {
  // return undefined if the value is null, undefined or empty
  if (!isNonEmptyString(value)) return undefined;

  return value;
};
