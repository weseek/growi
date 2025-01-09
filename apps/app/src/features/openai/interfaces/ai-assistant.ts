import type { IGrantedGroup, IUser, Ref } from '^/../../packages/core/dist';

import type { VectorStore } from '../server/models/vector-store';

/*
*  Objects
*/
export const AiAssistantShareScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;

export const AiAssistantOwnerAccessScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;


/*
*  Interfaces
*/
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantOwnerAccessScope = typeof AiAssistantOwnerAccessScope[keyof typeof AiAssistantOwnerAccessScope];

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
