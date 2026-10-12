import { ConfigSource } from '@growi/core/dist/interfaces';

const { getConfig } = vi.hoisted(() => ({ getConfig: vi.fn() }));

vi.mock('~/server/service/config-manager', () => ({
  configManager: { getConfig },
}));

import { readUsageBaseModel } from './usage-base-model';

// Model a ConfigManager whose db layer and env layer disagree: only a read that
// passes ConfigSource.env sees the env value.
const configureLayers = (opts: { db?: unknown; env?: unknown }): void => {
  getConfig.mockImplementation((key: string, source?: string) => {
    if (key !== 'ai:usageBaseModel') return undefined;
    if (source === ConfigSource.env) return opts.env;
    if (source === ConfigSource.db) return opts.db;
    return opts.db ?? opts.env;
  });
};

describe('readUsageBaseModel', () => {
  beforeEach(() => {
    getConfig.mockReset();
  });

  it('parses a provider/modelId key from env', () => {
    configureLayers({ env: 'openai/gpt-4o-mini' });
    expect(readUsageBaseModel()).toEqual({
      provider: 'openai',
      modelId: 'gpt-4o-mini',
    });
  });

  it('keeps a slash inside the model id', () => {
    configureLayers({ env: 'anthropic/claude/sonnet' });
    expect(readUsageBaseModel()).toEqual({
      provider: 'anthropic',
      modelId: 'claude/sonnet',
    });
  });

  it('ignores a db value and uses the env value only', () => {
    configureLayers({ db: 'anthropic/db-model', env: 'openai/env-model' });
    expect(readUsageBaseModel()).toEqual({
      provider: 'openai',
      modelId: 'env-model',
    });
  });

  it('returns null when only the db has a value', () => {
    configureLayers({ db: 'openai/db-model', env: undefined });
    expect(readUsageBaseModel()).toBeNull();
  });

  it.each([
    ['unset', undefined],
    ['null', null],
    ['empty string', ''],
    ['no separator', 'gpt-4o-mini'],
    ['unknown provider', 'nope/gpt-4o-mini'],
    ['empty model id', 'openai/'],
    ['non-string value', 42],
  ])('returns null for a malformed value (%s)', (_label, value) => {
    configureLayers({ env: value });
    expect(readUsageBaseModel()).toBeNull();
  });
});
