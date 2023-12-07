import type { Ref } from './common';
import type { HasObjectId } from './has-object-id';
import type { IPage } from './page';
import type { IRevision } from './revision';
import type { IUser } from './user';

export type IComment = {
  page: Ref<IPage>,
  creator: Ref<IUser>,
  revision: Ref<IRevision>,
  comment: string;
  replyTo?: string,
  createdAt: Date,
  updatedAt: Date,

  // base for inline comment
  inline: boolean,
};

export type ICommentHasId = IComment & HasObjectId;
export type ICommentHasIdList = ICommentHasId[];

export type IInlineComment = Omit<IComment, 'inline'> & {
  inline: true,
  firstLevelBlockXpath: string,
  innerHtmlDiff: string,
  resolvedBy?: Ref<IUser>,
  resolvedAt?: Date,
};

export const isInlineComment = (comment: IComment): comment is IInlineComment => {
  return comment.inline === true;
};