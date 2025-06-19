import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import type { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ATTR_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions/incubating';

import { getGrowiVersion } from '~/utils/growi-version';

import { httpInstrumentationConfig as httpInstrumentationConfigForAnonymize } from './anonymization';
import { addApplicationMetrics } from './custom-metrics';

type Configuration = Partial<NodeSDKConfiguration> & {
  resource: Resource;
};

let resource: Resource;
let configuration: Configuration;

export const generateNodeSDKConfiguration = (serviceInstanceId?: string, enableAnonymization = false): Configuration => {
  if (configuration == null) {
    const version = getGrowiVersion();

    resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'growi',
      [ATTR_SERVICE_VERSION]: version,
    });

    // Data anonymization configuration
    const httpInstrumentationConfig = enableAnonymization ? httpInstrumentationConfigForAnonymize : {};

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
  }

  if (serviceInstanceId != null) {
    configuration.resource = resource.merge(resourceFromAttributes({
      [ATTR_SERVICE_INSTANCE_ID]: serviceInstanceId,
    }));
  }

  return configuration;
};
