/*
 * Common types and interfaces
 */

import { HasObjectId } from './has-object-id';


// Foreign key field
export type Ref<T> = string | T & HasObjectId;

export type Nullable<T> = T | null | undefined;

export const isNotRef = <T>(ref: string | T & HasObjectId): ref is T & HasObjectId => {
  return !(typeof ref === 'string');
};
