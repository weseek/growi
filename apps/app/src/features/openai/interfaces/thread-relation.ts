import type { IUser, Ref, HasObjectId } from '@growi/core';

import type { AiAssistant } from './ai-assistant';

export interface IThreadRelation {
  userId: Ref<IUser>;
  aiAssistant: Ref<AiAssistant>;
  threadId: string;
  title?: string;
  expiredAt: Date;
}

export type IThreadRelationHasId = IThreadRelation & HasObjectId;

export type IApiv3DeleteThreadParams = {
  aiAssistantId: string;
  threadRelationId: string;
};
