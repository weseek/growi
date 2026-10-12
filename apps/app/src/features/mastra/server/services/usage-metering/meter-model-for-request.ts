import type { MastraModelConfig } from '@mastra/core/llm';
import type { RequestContext } from '@mastra/core/request-context';

import { type AiUsageFeature, recordAiUsage } from '~/features/ai-usage/server';
import loggerFactory from '~/utils/logger';

import type { MastraRequestContextShape } from '../mastra-modules/types/request-context';
import { type OnCall, withUsageMetering } from './with-usage-metering';

const logger = loggerFactory('growi:service:mastra:usage-metering');

// Only `get` is needed, which also lets wider shapes (suggest-path) be passed.
type UsageContext = Pick<RequestContext<MastraRequestContextShape>, 'get'>;

const recordEachCall =
  (requestContext: UsageContext, feature: AiUsageFeature): OnCall =>
  (usage) => {
    // Read at record time: Mastra may resolve the model with an empty context,
    // and a missing user must not fail the LLM call (design.md, 2.8).
    const user = requestContext.get('user');
    const modelKey = requestContext.get('modelKey');
    if (user == null || modelKey == null) {
      logger.error(
        { feature, modelKey, hasUser: user != null, usage },
        'Cannot record AI usage without a user and a model key in the request context',
      );
      return;
    }
    return recordAiUsage({
      userId: String(user._id),
      feature,
      modelKey,
      calls: [usage],
    });
  };

/**
 * Wrap a (possibly cached) model for one request. Usage goes to the request's
 * usage meter when there is one, otherwise each call is recorded on its own.
 * The given model is left as-is, so the cache keeps holding the unwrapped one.
 */
export const meterModelForRequest = (
  requestContext: UsageContext,
  feature: AiUsageFeature,
  model: MastraModelConfig,
): MastraModelConfig => {
  const usageMeter = requestContext.get('usageMeter');
  const onCall: OnCall =
    usageMeter != null
      ? (usage) => usageMeter.add(usage)
      : recordEachCall(requestContext, feature);
  return withUsageMetering(model, onCall);
};
