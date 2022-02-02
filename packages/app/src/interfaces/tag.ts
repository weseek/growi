import { HasObjectId } from './has-object-id';

export type ITag = {
  name: string,
  createdAt: Date;
}

export type ITagCount = Omit<ITag, 'createdAt'> & {count: number}

export type ITagCountHasId = ITagCount & HasObjectId
