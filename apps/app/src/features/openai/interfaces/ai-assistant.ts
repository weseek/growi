import type { IGrantedGroup, IUser, Ref } from '@growi/core';

import type { VectorStore } from '../server/models/vector-store';

/*
*  Objects
*/
export const AiAssistantShareScope = {
  PUBLIC_ONLY: 'publicOnly',
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
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantOwnerAccessScope = typeof AiAssistantAccessScope[keyof typeof AiAssistantAccessScope];

export interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  pagePathPatterns: string[],
  vectorStore: Ref<VectorStore>
  owner: Ref<IUser>
  grantedUsers?: IUser[]
  grantedGroups?: IGrantedGroup[]
  shareScope: AiAssistantShareScope
  ownerAccessScope: AiAssistantOwnerAccessScope
}
