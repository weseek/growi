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
