import { describe, expect, it } from 'vitest';

import { ChatIntegrationKey } from './chat-integration-key';

describe('ChatIntegrationKey schema', () => {
  const allFields = [
    'relationId',
    'side',
    'keyId',
    'key',
    'validFrom',
    'revokedAt',
  ] as const;

  it.each(allFields)('declares field "%s"', (field) => {
    expect(ChatIntegrationKey.schema.path(field)).toBeDefined();
  });

  it('side enum contains exactly own and peer', () => {
    const path = ChatIntegrationKey.schema.path('side');
    const enumValues = (path as unknown as { enumValues: string[] }).enumValues;
    expect(enumValues).toEqual(expect.arrayContaining(['own', 'peer']));
    expect(enumValues).toHaveLength(2);
  });

  it('revokedAt defaults to null', () => {
    const path = ChatIntegrationKey.schema.path('revokedAt');
    expect(
      (path as unknown as { defaultValue: unknown }).defaultValue,
    ).toBeNull();
  });

  const getIndexes = () =>
    ChatIntegrationKey.schema.indexes() as unknown as ReadonlyArray<
      [Record<string, unknown>, Record<string, unknown>]
    >;

  it('declares a unique compound index on (relationId, side, keyId)', () => {
    const indexes = getIndexes();
    const found = indexes.find(([fields, options]) => {
      const keys = Object.keys(fields);
      return (
        keys.length === 3 &&
        keys.includes('relationId') &&
        keys.includes('side') &&
        keys.includes('keyId') &&
        options.unique === true
      );
    });
    expect(found).toBeDefined();
  });

  it('uses collection name chat_integration_keys', () => {
    const collectionName = (
      ChatIntegrationKey.schema as unknown as {
        options?: { collection?: string };
      }
    ).options?.collection;
    expect(collectionName).toBe('chat_integration_keys');
  });
});
