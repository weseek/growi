import { describe, expect, it } from 'vitest';

import { ChatPendingPairing } from './pending-pairing';

describe('ChatPendingPairing schema', () => {
  const allFields = [
    'registrationCode',
    'proxyUri',
    'growiUri',
    'createdBy',
    'ownKeyId',
    'ownKeyPair',
    'expiresAt',
  ] as const;

  it.each(allFields)('declares field "%s"', (field) => {
    expect(ChatPendingPairing.schema.path(field)).toBeDefined();
  });

  it('createdBy is an ObjectId', () => {
    const path = ChatPendingPairing.schema.path('createdBy');
    expect(path.instance.toLowerCase()).toBe('objectid');
  });

  const getIndexes = () =>
    ChatPendingPairing.schema.indexes() as unknown as ReadonlyArray<
      [Record<string, unknown>, Record<string, unknown>]
    >;

  it('declares a unique index on registrationCode', () => {
    const indexes = getIndexes();
    const found = indexes.find(([fields, options]) => {
      const keys = Object.keys(fields);
      return (
        keys.length === 1 &&
        keys[0] === 'registrationCode' &&
        options.unique === true
      );
    });
    expect(found).toBeDefined();
  });

  it('declares a TTL index on expiresAt with expireAfterSeconds: 0', () => {
    const indexes = getIndexes();
    const found = indexes.find(([fields, options]) => {
      const keys = Object.keys(fields);
      return (
        keys.length === 1 &&
        keys[0] === 'expiresAt' &&
        options.expireAfterSeconds === 0
      );
    });
    expect(found).toBeDefined();
  });

  it('uses collection name chat_pending_pairings', () => {
    const collectionName = (
      ChatPendingPairing.schema as unknown as {
        options?: { collection?: string };
      }
    ).options?.collection;
    expect(collectionName).toBe('chat_pending_pairings');
  });
});
