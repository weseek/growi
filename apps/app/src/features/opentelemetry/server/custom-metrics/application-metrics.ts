import { diag, metrics } from '@opentelemetry/api';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:opentelemetry:custom-metrics:application-metrics');
const loggerDiag = diag.createComponentLogger({ namespace: 'growi:custom-metrics:application' });


export function addApplicationMetrics(): void {
  logger.info('Starting application info metrics collection');

  const meter = metrics.getMeter('growi-application-metrics', '1.0.0');

  // Info metrics: GROWI instance information (Prometheus info pattern)
  const growiInfoGauge = meter.createObservableGauge('growi.info', {
    description: 'GROWI instance information (always 1)',
    unit: '1',
  });

  // Info metrics collection callback
  meter.addBatchObservableCallback(
    async(result) => {
      try {
        // Dynamic import to avoid circular dependencies
        const { growiInfoService } = await import('~/server/service/growi-info');

        const growiInfo = await growiInfoService.getGrowiInfo(true);

        // Info metrics always have value 1, with information stored in labels
        result.observe(growiInfoGauge, 1, {
          // Dynamic information that can change through configuration
          service_instance_id: growiInfo.serviceInstanceId || '',
          site_url: growiInfo.appSiteUrl,
          wiki_type: growiInfo.wikiType,
          external_auth_types: growiInfo.additionalInfo?.activeExternalAccountTypes?.join(',') || '',
        });
      }
      catch (error) {
        loggerDiag.error('Failed to collect application info metrics', { error });
      }
    },
    [growiInfoGauge],
  );

  logger.info('Application info metrics collection started successfully');
}
