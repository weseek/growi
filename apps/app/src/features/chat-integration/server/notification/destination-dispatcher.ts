import loggerFactory from '~/utils/logger';

import type { DestinationDispatcher } from './destination-registry';

const logger = loggerFactory(
  'growi:features:chat-integration:notification:destination-dispatcher',
);

/**
 * Placeholder receiver for Gen 2 destinations (task 2.3's explicit scope:
 * "受け側は仮のものでよい" -- design.md task 2.3). The real implementation --
 * writing into `NotificationOutbox` and draining it to the proxy -- is task
 * 8.1/8.2's `NotificationOutbox`/`NotificationDispatcher` boundary. Building
 * that here would preempt that task's scope.
 *
 * This still genuinely runs (it is not a no-op that silently discards): it
 * logs the dispatch so `DestinationRegistry`'s iteration is independently
 * observable without relying on a future task's code, and it can safely be
 * swapped for the real writer later without changing any call site.
 */
export const dispatchGen2Destination: DestinationDispatcher = async (
  destination,
) => {
  logger.debug(
    { destination },
    'Gen 2 destination dispatched (placeholder receiver)',
  );
};
