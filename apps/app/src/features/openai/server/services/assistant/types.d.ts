const AssistantType = {
  SEARCH: 'Search',
  CHAT: 'Chat',
  EDIT: 'Edit',
} as const;

type AssistantType = typeof AssistantType[keyof typeof AssistantType];
