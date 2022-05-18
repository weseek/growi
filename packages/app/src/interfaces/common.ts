/*
 * Common types and interfaces
 */

import { HasObjectId } from './has-object-id';

/*
* Foreign key field
*/
// :new: Foreign key field that not needed to insert ObjectId
export type Ref<T> = string | T;
// ※ HasObjectId will be abolished. See https://dev.growi.org/6279e91bd5f269990fb58844
export type RefUsingLegacyHasObjectId<T> = string | T & HasObjectId;


export type Nullable<T> = T | null | undefined;
