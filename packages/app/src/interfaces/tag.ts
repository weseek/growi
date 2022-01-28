import { HasObjectId } from './has-object-id';

export type ITag = {
  name: string,
  createdAt: Date;
}
export type ITagData = {
  name: string,
  count: number,
}
export type ITagDataHasId = ITagData & HasObjectId
