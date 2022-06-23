/*
 * Common types and interfaces
 */

import { HasObjectId } from './has-object-id';


// Foreign key field
export type Ref<T> = string | T & HasObjectId;

export type Nullable<T> = T | null | undefined;

export const isPopulated = <T>(ref: Ref<T>): ref is T & HasObjectId => {
  return !(typeof ref === 'string');
};

export const getIdForRef = <T>(ref: Ref<T>): string => {
  return isPopulated(ref)
    ? ref._id
    : ref;
};
