import { withAnthropicCacheControl } from './with-anthropic-cache-control';

describe('withAnthropicCacheControl', () => {
  it('adds ephemeral cacheControl under the anthropic namespace for an anthropic model', () => {
    expect(withAnthropicCacheControl('anthropic', {})).toEqual({
      anthropic: { cacheControl: { type: 'ephemeral' } },
    });
  });

  it('keeps the admin-configured anthropic options alongside cacheControl', () => {
    expect(
      withAnthropicCacheControl('anthropic', {
        anthropic: { thinking: { type: 'enabled', budgetTokens: 12000 } },
      }),
    ).toEqual({
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 12000 },
        cacheControl: { type: 'ephemeral' },
      },
    });
  });

  it('lets an explicit admin cacheControl win (e.g. a 1h ttl)', () => {
    const options = {
      anthropic: { cacheControl: { type: 'ephemeral', ttl: '1h' } },
    };

    expect(withAnthropicCacheControl('anthropic', options)).toEqual(options);
  });

  it.each([
    'openai',
    'google',
    'azure-openai',
  ] as const)('returns the options untouched for %s', (provider) => {
    const options = { [provider]: { foo: 'bar' } };

    expect(withAnthropicCacheControl(provider, options)).toEqual(options);
  });

  it('does not mutate the input options', () => {
    const options = { anthropic: { sendReasoning: true } };

    withAnthropicCacheControl('anthropic', options);

    expect(options).toEqual({ anthropic: { sendReasoning: true } });
  });
});
