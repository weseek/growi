import { diag, metrics } from '@opentelemetry/api';

const logger = diag.createComponentLogger({ namespace: 'growi:custom-metrics:application' });

export interface ApplicationMetricsConfig {
  enabled: boolean;
}

export function addApplicationMetrics(config: ApplicationMetricsConfig): void {
  if (!config.enabled) {
    logger.debug('Application metrics collection is disabled');
    return;
  }

  logger.info('Starting application metrics collection');

  const meter = metrics.getMeter('growi-application-metrics', '1.0.0');

  // Dummy metrics (for future application-specific metrics)
  const dummyGauge = meter.createObservableGauge('growi.app.dummy.metric', {
    description: 'Dummy metric for application metrics (placeholder)',
    unit: 'count',
  });

  // Metrics collection callback
  meter.addBatchObservableCallback(
    (result) => {
      try {
        // Currently sending dummy values (actual metrics to be implemented later)
        result.observe(dummyGauge, 1, {
          'app.name': 'growi',
        });
      }
      catch (error) {
        logger.error('Failed to collect application metrics', { error });
      }
    },
    [dummyGauge],
  );

  logger.info('Application metrics collection started successfully');
}
