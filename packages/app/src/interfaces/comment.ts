import { Nullable, RefUsingLegacyHasObjectId } from './common';
import { HasObjectId } from './has-object-id';
import { IPage } from './page';
import { IRevision } from './revision';
import { IUser } from './user';

export type IComment = {
  comment: string;
  commentPosition: number,
  isMarkdown: boolean,
  replyTo: Nullable<string>,
  createdAt: Date,
  updatedAt: Date,
  page: RefUsingLegacyHasObjectId<IPage>,
  revision: RefUsingLegacyHasObjectId<IRevision>,
  creator: IUser,
};

export type ICommentHasId = IComment & HasObjectId;
export type ICommentHasIdList = ICommentHasId[];
