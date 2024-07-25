/*
 * Common types and interfaces
 */


import type { Types } from 'mongoose';

import type { HasObjectId } from './has-object-id';

type ObjectId = Types.ObjectId;

// Foreign key field
export type Ref<T> = string | ObjectId | T & HasObjectId;

export type Nullable<T> = T | null | undefined;

export const isPopulated = <T>(ref?: T & HasObjectId | Ref<T>): ref is T & HasObjectId => {
  return ref != null && typeof ref === 'object' && '_id' in ref;
};

export const getIdForRef = <T>(ref: T & HasObjectId | Ref<T>): string | ObjectId => {
  return isPopulated(ref)
    ? ref._id
    : ref;
};
