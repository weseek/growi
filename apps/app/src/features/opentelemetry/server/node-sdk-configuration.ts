import type { Attributes } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import type { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ATTR_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions/incubating';

import { configManager } from '~/server/service/config-manager';
import { getGrowiVersion } from '~/utils/growi-version';

import { httpInstrumentationConfig as httpInstrumentationConfigForAnonymize } from './anonymization';
import { addApplicationMetrics } from './custom-metrics';
import { addUserCountsMetrics } from './custom-metrics/user-counts-metrics';
import { getOsResourceAttributes } from './custom-resource-attributes';

type Option = {
  enableAnonymization?: boolean,
}

type Configuration = Partial<NodeSDKConfiguration> & {
  resource: Resource;
};

let resource: Resource;
let configuration: Configuration;

export const generateNodeSDKConfiguration = (opts?: Option): Configuration => {
  if (configuration == null) {
    const version = getGrowiVersion();

    // Collect OS resource attributes
    const osAttributes = getOsResourceAttributes();

    resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'growi',
      [ATTR_SERVICE_VERSION]: version,
      // Add OS resource attributes
      ...osAttributes,
    });

    // Data anonymization configuration
    const httpInstrumentationConfig = opts?.enableAnonymization ? httpInstrumentationConfigForAnonymize : {};

    configuration = {
      resource,
      traceExporter: new OTLPTraceExporter(),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
      }),
      instrumentations: [getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-bunyan': {
          enabled: false,
        },
        // disable fs instrumentation since this generates very large amount of traces
        // see: https://opentelemetry.io/docs/languages/js/libraries/#registration
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        // HTTP instrumentation with anonymization
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ...httpInstrumentationConfig,
        },
      })],
    };

    // add custom metrics
    addApplicationMetrics();
    addUserCountsMetrics();
  }

  return configuration;
};

/**
 * Generate additional attributes after database initialization
 * This function should be called after database is available
 */
export const generateAdditionalResourceAttributes = async(opts?: Option): Promise<Resource> => {
  if (resource == null) {
    throw new Error('Resource is not initialized. Call generateNodeSDKConfiguration first.');
  }

  const serviceInstanceId = configManager.getConfig('otel:serviceInstanceId')
    ?? configManager.getConfig('app:serviceInstanceId');

  const { getApplicationResourceAttributes } = await import('./custom-resource-attributes');

  return resource.merge(resourceFromAttributes({
    [ATTR_SERVICE_INSTANCE_ID]: serviceInstanceId,
    ...await getApplicationResourceAttributes(),
  }));
};
