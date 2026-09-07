import { describe, expect, it } from 'vitest';

import { ChatChannelPermission } from './chat-channel-permission';

describe('ChatChannelPermission schema', () => {
  const allFields = ['relationId', 'commandName', 'allowedChannels'] as const;

  it.each(allFields)('declares field "%s"', (field) => {
    expect(ChatChannelPermission.schema.path(field)).toBeDefined();
  });

  it('does NOT declare a per-row updatedAt (version lives on chat_relations.settingsVersion instead)', () => {
    expect(ChatChannelPermission.schema.path('updatedAt')).toBeUndefined();
  });

  const getIndexes = () =>
    ChatChannelPermission.schema.indexes() as unknown as ReadonlyArray<
      [Record<string, unknown>, Record<string, unknown>]
    >;

  it('declares a unique compound index on (relationId, commandName)', () => {
    const indexes = getIndexes();
    const found = indexes.find(([fields, options]) => {
      const keys = Object.keys(fields);
      return (
        keys.length === 2 &&
        keys.includes('relationId') &&
        keys.includes('commandName') &&
        options.unique === true
      );
    });
    expect(found).toBeDefined();
  });

  it('uses collection name chat_channel_permissions', () => {
    const collectionName = (
      ChatChannelPermission.schema as unknown as {
        options?: { collection?: string };
      }
    ).options?.collection;
    expect(collectionName).toBe('chat_channel_permissions');
  });
});
