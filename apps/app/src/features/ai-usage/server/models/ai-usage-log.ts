import { Schema } from 'mongoose';

import type { AiProvider } from '~/features/mastra/interfaces/ai-provider';
import type { ModelKey } from '~/features/mastra/interfaces/model-key';
import { Prisma } from '~/generated/prisma/client';
import { getOrCreateModel } from '~/server/util/mongoose-utils';
import type { prisma } from '~/utils/prisma';

import type { AiUsageFeature } from '../../interfaces/ai-usage-feature';
import type { TokenUsage } from '../services/token-usage';

const TTL_90_DAYS_IN_SECONDS = 90 * 24 * 60 * 60;

export type AiUsageLogInput = {
  readonly userId: string;
  readonly feature: AiUsageFeature;
  readonly provider: AiProvider;
  readonly modelId: string;
  readonly callCount: number;
  readonly usage: TokenUsage;
  readonly estimatedCostUsd: number | null;
  readonly weightedUnits: number | null;
  /** The base model key used for weightedUnits; null when it was unset. */
  readonly baseModelKey: ModelKey | null;
};

// TODO: remove mongoose model and use `prisma db push` after all models are migrated to prisma.
// Until then, use mongoose to automatically create collections and indexes when connected.
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feature: { type: String, required: true },
  provider: { type: String, required: true },
  modelId: { type: String, required: true },
  callCount: { type: Number, required: true },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  reasoningTokens: { type: Number, default: null },
  cacheReadTokens: { type: Number, default: null },
  cacheWriteTokens: { type: Number, default: null },
  estimatedCostUsd: { type: Number, default: null },
  weightedUnits: { type: Number, default: null },
  baseModelKey: { type: String, default: null },
  createdAt: { type: Date, required: true, default: Date.now },
});
schema.index({ createdAt: 1 }, { expireAfterSeconds: TTL_90_DAYS_IN_SECONDS });

getOrCreateModel('AiUsageLog', schema);

export const extension = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      aiusagelogs: {
        // for backward compatibility with mongoose
        _id: {
          needs: { id: true },
          compute(model) {
            return model.id;
          },
        },
        // for backward compatibility with mongoose
        __v: {
          needs: { v: true },
          compute(model) {
            return model.v;
          },
        },
      },
    },
    model: {
      aiusagelogs: {
        async createLog(input: AiUsageLogInput): Promise<void> {
          const context =
            Prisma.getExtensionContext<typeof prisma.aiusagelogs>(this);

          await context.create({
            data: {
              userId: input.userId,
              feature: input.feature,
              provider: input.provider,
              modelId: input.modelId,
              callCount: input.callCount,
              inputTokens: input.usage.inputTokens,
              outputTokens: input.usage.outputTokens,
              reasoningTokens: input.usage.reasoningTokens,
              cacheReadTokens: input.usage.cacheReadTokens,
              cacheWriteTokens: input.usage.cacheWriteTokens,
              estimatedCostUsd: input.estimatedCostUsd,
              weightedUnits: input.weightedUnits,
              baseModelKey: input.baseModelKey,
            },
          });
        },
      },
    },
  });
});
