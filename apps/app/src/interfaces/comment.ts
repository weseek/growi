import { Nullable, Ref, HasObjectId } from '@growi/core';

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
  page: Ref<IPage>,
  revision: Ref<IRevision>,
  creator: IUser,
};

export interface ICommentPostArgs {
  commentForm: {
    comment: string,
    revisionId: string,
    replyTo: string|undefined
  },
  slackNotificationForm: {
    isSlackEnabled: boolean|undefined,
    slackChannels: string|undefined,
  },
}

export type ICommentHasId = IComment & HasObjectId;
export type ICommentHasIdList = ICommentHasId[];
