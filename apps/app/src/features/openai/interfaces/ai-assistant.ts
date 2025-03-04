import type {
  IGrantedGroup, IUser, Ref, HasObjectId,
} from '@growi/core';

import type { IVectorStore } from './vector-store';


export const LIMIT_LEARNABLE_PAGE_COUNT = 5;

/*
*  Objects
*/
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
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantAccessScope = typeof AiAssistantAccessScope[keyof typeof AiAssistantAccessScope];

export interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  pagePathPatterns: string[],
  vectorStore: Ref<IVectorStore>
  owner: Ref<IUser>
  grantedGroupsForShareScope?: IGrantedGroup[]
  grantedGroupsForAccessScope?: IGrantedGroup[]
  shareScope: AiAssistantShareScope
  accessScope: AiAssistantAccessScope
  isDefault: boolean
}

export type AiAssistantHasId = AiAssistant & HasObjectId

export type UpsertAiAssistantData = Omit<AiAssistant, 'owner' | 'vectorStore'>

export type AccessibleAiAssistants = {
  myAiAssistants: AiAssistant[],
  teamAiAssistants: AiAssistant[],
}

export type AccessibleAiAssistantsHasId = {
  myAiAssistants: AiAssistantHasId[],
  teamAiAssistants: AiAssistantHasId[],
}
