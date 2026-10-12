import {
  AI_DISABLED_REASON_CATALOG_STALE,
  readAiDisabledReason,
} from '~/features/ai-usage/server';
import { configManager } from '~/server/service/config-manager';
import CronService from '~/server/service/cron';
import loggerFactory from '~/utils/logger';

import { refreshModelCatalog } from './ai-sdk-modules/refresh-model-catalog';
import { isAiEnabled } from './is-ai-enabled';

const logger = loggerFactory(
  'growi:features:mastra:services:model-catalog-refresh-jobs',
);

/**
 * The refresh runs while AI is enabled, and also while AI is disabled for the
 * stale-catalog reason (so the catalog can recover). Any other disabled state
 * must not communicate externally.
 */
export const isCatalogRefreshAllowed = (): boolean =>
  isAiEnabled() || readAiDisabledReason() === AI_DISABLED_REASON_CATALOG_STALE;

/**
 * Periodic model-catalog refresh (Req 9.3). Instantiated and started ONLY when
 * the refresh is allowed and the schedule config is non-empty (see
 * startModelCatalogRefreshCronIfEnabled).
 */
class ModelCatalogRefreshCronService extends CronService {
  override getCronSchedule(): string {
    // `?? ''` only satisfies the non-nullable return type: this service is
    // constructed solely by startModelCatalogRefreshCronIfEnabled AFTER it has
    // confirmed a non-empty schedule, so '' is never actually reached here.
    return configManager.getConfig('ai:modelCatalogRefreshCronSchedule') ?? '';
  }

  override async executeJob(): Promise<void> {
    // refreshModelCatalog throws on failure WITHOUT persisting, so a failed
    // tick keeps the last-good catalog (Req 9.4); the CronService base wraps
    // executeJob and logs the error, and the schedule keeps running.
    await refreshModelCatalog();
  }
}

/**
 * Start the periodic refresh cron IFF the refresh is allowed
 * (isCatalogRefreshAllowed) AND `ai:modelCatalogRefreshCronSchedule` is set.
 * Called from Crowi#setupCron at boot. An invalid schedule expression is logged
 * and skipped — it must never break the boot sequence (Req 9.4).
 *
 * The schedule defaults to a daily expression; setting the env var to an empty
 * string opts out (e.g. air-gapped AI deployments).
 */
export const startModelCatalogRefreshCronIfEnabled = (): void => {
  if (!isCatalogRefreshAllowed()) {
    return;
  }

  const schedule = configManager.getConfig(
    'ai:modelCatalogRefreshCronSchedule',
  );
  if (schedule == null || schedule.trim() === '') {
    return;
  }

  try {
    new ModelCatalogRefreshCronService().startCron();
    logger.info(
      `Scheduled the periodic model-catalog refresh (cron: '${schedule}')`,
    );
  } catch (err) {
    // e.g. an invalid cron expression — refuse to crash the boot for an
    // optional freshness feature; the bundled/last-good catalog stays in effect.
    logger.error(
      `Failed to schedule the model-catalog refresh cron (cron: '${schedule}')`,
      err,
    );
  }
};

/**
 * Fire a one-shot catalog refresh after the server is up IFF the refresh is
 * allowed (isCatalogRefreshAllowed) AND `ai:modelCatalogRefreshOnStartup` is
 * true (the default). Fire-and-forget: the boot sequence is never blocked, and a failure only logs a
 * warning — the bundled/last-good catalog stays in effect (Req 9.4).
 */
export const triggerModelCatalogRefreshOnStartupIfEnabled = (): void => {
  if (!isCatalogRefreshAllowed()) {
    return;
  }

  if (configManager.getConfig('ai:modelCatalogRefreshOnStartup') !== true) {
    return;
  }

  refreshModelCatalog().catch((err) => {
    logger.warn(
      'Startup model-catalog refresh failed; the last-good catalog stays in effect.',
      err,
    );
  });
};
