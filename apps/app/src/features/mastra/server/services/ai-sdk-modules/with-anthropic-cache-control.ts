import type { AiProvider } from '~/features/mastra/interfaces/ai-provider';
import type { ModelProviderOptions } from '~/features/mastra/interfaces/allowed-model';

// Anthropic caches nothing unless the request carries cache_control (OpenAI and
// Google cache implicitly). `@ai-sdk/anthropic` forwards the call-level
// `anthropic.cacheControl` option as the request's top-level cache_control, so
// the cache breakpoint follows the newest content on every tool-loop step.
// An admin-configured `anthropic.cacheControl` (e.g. ttl: '1h') takes precedence.
export const withAnthropicCacheControl = (
  provider: AiProvider,
  providerOptions: ModelProviderOptions,
): ModelProviderOptions => {
  if (provider !== 'anthropic') {
    return providerOptions;
  }

  return {
    ...providerOptions,
    anthropic: {
      cacheControl: { type: 'ephemeral' },
      ...providerOptions.anthropic,
    },
  };
};
