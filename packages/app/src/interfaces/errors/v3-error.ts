import { ErrorV3 } from '@growi/core';

export type IErrorV3 = ErrorV3

// type guard
export const isErrorV3 = (args: any): args is IErrorV3 => {
  return args.message != null;
};
