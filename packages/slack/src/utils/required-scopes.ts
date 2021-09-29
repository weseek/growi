export const requiredScopes: string[] = [
  'commands',
  'team:read',
  'chat:write',
  'chat:write.public',
  // 'channels:join', // add this if use JoinToConversationMiddleware
  'channels:history',
  'groups:history',
  'im:history',
  'mpim:history',
];
