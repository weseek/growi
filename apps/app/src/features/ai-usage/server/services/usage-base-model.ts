import { ConfigSource } from '@growi/core/dist/interfaces';

import type { AiProvider } from '~/features/mastra/interfaces/ai-provider';
import { parseModelKey } from '~/features/mastra/interfaces/model-key';
import { configManager } from '~/server/service/config-manager';

export type UsageBaseModel = {
  readonly provider: AiProvider;
  readonly modelId: string;
};

/** Reads ai:usageBaseModel from env only. null when unset or malformed. */
export const readUsageBaseModel = (): UsageBaseModel | null => {
  const value: unknown = configManager.getConfig(
    'ai:usageBaseModel',
    ConfigSource.env,
  );
  return typeof value === 'string' ? parseModelKey(value) : null;
};
