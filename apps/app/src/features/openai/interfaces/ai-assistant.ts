import type { IGrantedGroup, IUser, Ref } from '@growi/core';

import type { VectorStore } from '../server/models/vector-store';

/*
*  Objects
*/
export const AiAssistantScopeType = {
  ACCESS: 'Access',
  SHARE: 'Share',
} as const;

export const AiAssistantShareScope = {
  SAME_AS_ACCESS_SCOPE: 'sameAsAccessScope',
  PUBLIC_ONLY: 'publicOnly', // TODO: Rename to "PUBLIC"
  OWNER: 'owner',
  GROUPS: 'groups',
} as const;

export const AiAssistantAccessScope = {
  PUBLIC_ONLY: 'publicOnly',
  OWNER: 'owner',
  GROUPS: 'groups',
} as const;

/*
*  Interfaces
*/
export type AiAssistantScopeType = typeof AiAssistantScopeType[keyof typeof AiAssistantScopeType];
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantAccessScope = typeof AiAssistantAccessScope[keyof typeof AiAssistantAccessScope];

export interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  pagePathPatterns: string[],
  vectorStore: Ref<VectorStore>
  owner: Ref<IUser>
  grantedGroupsForShareScope?: IGrantedGroup[]
  grantedGroupsForAccessScope?: IGrantedGroup[]
  shareScope: AiAssistantShareScope
  accessScope: AiAssistantAccessScope
}

export type IApiv3AiAssistantCreateParams = Omit<AiAssistant, 'owner' | 'vectorStore'>

export type AccessibleAiAssistants = {
  myAiAssistants: AiAssistant[],
  teamAiAssistants: AiAssistant[],
}
