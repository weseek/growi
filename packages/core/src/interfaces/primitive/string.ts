export type NonEmptyString = string & { readonly __brand: unique symbol };

export const isNonEmptyString = (value: string | null | undefined): value is NonEmptyString => {
  return value != null && value.length > 0;
};

export const toNonEmptyString = (value: string): NonEmptyString => {
  // throw Error if the value is null, undefined or empty
  if (!isNonEmptyString(value)) throw new Error(`Expected a non-empty string, but received: ${value}`);
  return value;
};

export const toNonEmptyStringOrUndefined = (value: string | null | undefined): NonEmptyString | undefined => {
  // return undefined if the value is null, undefined or empty
  if (!isNonEmptyString(value)) return undefined;
  return value;
};

export type NonBlankString = string & { readonly __brand: unique symbol };

export const isNonBlankString = (value: string | null | undefined): value is NonBlankString => {
  return value != null && value.trim().length > 0;
};

export const toNonBlankString = (value: string): NonBlankString => {
  // throw Error if the value is null, undefined or empty
  if (!isNonBlankString(value)) throw new Error(`Expected a non-blank string, but received: ${value}`);
  return value;
};

export const toNonBlankStringOrUndefined = (value: string | null | undefined): NonBlankString | undefined => {
  // return undefined if the value is null, undefined or blank (empty or whitespace only)
  if (!isNonBlankString(value)) return undefined;
  return value;
};
