/*
 * Common types and interfaces
 */


import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;

// Foreign key field
export type Ref<T> = string | ObjectId | T & { _id: string | ObjectId };

export type Nullable<T> = T | null | undefined;

export const isPopulated = <T>(ref: Ref<T>): ref is T & { _id: string | ObjectId } => {
  return ref != null && typeof ref !== 'string' && !(ref instanceof Types.ObjectId);
};

export const getIdForRef = <T>(ref: Ref<T>): string | ObjectId => {
  return isPopulated(ref)
    ? ref._id
    : ref;
};

export const getIdStringForRef = <T>(ref: Ref<T>): string => {
  return getIdForRef(ref).toString();
};
