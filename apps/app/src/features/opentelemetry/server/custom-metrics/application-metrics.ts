import { diag, metrics } from '@opentelemetry/api';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:opentelemetry:custom-metrics:application-metrics');
const loggerDiag = diag.createComponentLogger({ namespace: 'growi:custom-metrics:application' });


export function addApplicationMetrics(): void {
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
        loggerDiag.error('Failed to collect application metrics', { error });
      }
    },
    [dummyGauge],
  );

  logger.info('Application metrics collection started successfully');
}
