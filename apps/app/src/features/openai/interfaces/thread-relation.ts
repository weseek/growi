import type { IUser, Ref, HasObjectId } from '@growi/core';

import type { AiAssistant } from './ai-assistant';


export const ThreadType = {
  KNOWLEDGE: 'knowledge',
  EDITOR: 'editor',
} as const;

export type ThreadType = typeof ThreadType[keyof typeof ThreadType];

export interface IThreadRelation {
  userId: Ref<IUser>
  aiAssistant: Ref<AiAssistant>
  threadId: string;
  title?: string;
  type: ThreadType;
  expiredAt: Date;
  isActive: boolean;
}

export type IThreadRelationHasId = IThreadRelation & HasObjectId;

export type IApiv3DeleteThreadParams = {
  aiAssistantId: string
  threadRelationId: string;
}
