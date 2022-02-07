/*
 * Common types and interfaces
 */

import { HasObjectId } from './has-object-id';


// Foreign key field
export type Ref<T> = string | T & HasObjectId;
