export const aiServiceType = {
  OPEN_AI: 'openai',
  AZURE_OPENAI: 'azure-openai',
} as const;
export type aiServiceType = typeof aiServiceType[keyof typeof aiServiceType];
export const aiServiceTypes = Object.values(aiServiceType);
