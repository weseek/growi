/*
*  Objects
*/
export const AiAssistantType = {
  KNOWLEDGE: 'knowledge',
  // EDITOR: 'editor',
  // LEARNING: 'learning',
} as const;

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
export type AiAssistantType = typeof AiAssistantType[keyof typeof AiAssistantType];
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantOwnerAccessScope = typeof AiAssistantOwnerAccessScope[keyof typeof AiAssistantOwnerAccessScope];
