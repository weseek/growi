import { Nullable, Ref } from './common';
import { IPage } from './page';
import { IUser } from './user';
import { IRevision } from './revision';
import { HasObjectId } from './has-object-id';

export type IComment = {
  comment: string;
  commentPosition: number,
  isMarkdown: boolean,
  replyTo: Nullable<string>,
  createdAt: Date,
  updatedAt: Date,
  page: Ref<IPage>,
  revision: Ref<IRevision>,
  creator: IUser,
};

export type ICommentHasId = IComment & HasObjectId;
export type ICommentHasIdList = ICommentHasId[];
