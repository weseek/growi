import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_INSTANCE_ID, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { initLogger } from './logger';


const logger = loggerFactory('growi:opentelemetry');


let sdkInstance: NodeSDK;

function generateNodeSDKConfiguration(name: string, version: string): Partial<NodeSDKConfiguration> {
  return {
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: name,
      [SEMRESATTRS_SERVICE_INSTANCE_ID]: configManager.getConfig('crowi', 'otel:serviceInstanceId'),
      [SEMRESATTRS_SERVICE_VERSION]: version,
    }),
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 10000,
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
    })],
  };
}

/**
 * Overwrite "OTEL_SDK_DISABLED" env var before sdk.start() is invoked if needed.
 * Since otel library sees it.
 */
function overwriteSdkDisabled(): void {
  const instrumentationEnabled = configManager.getConfig('crowi', 'otel:enabled');
  if (instrumentationEnabled === false) {
    logger.warn("OTEL_SDK_DISABLED will be set 'true' since GROWI's 'otel:enabled' config is false.");
    process.env.OTEL_SDK_DISABLED = 'true';
  }
}

export const startInstrumentation = (version: string): void => {
  initLogger();

  overwriteSdkDisabled();

  if (sdkInstance != null) {
    logger.warn('OpenTelemetry instrumentation already started');
    return;
  }

  sdkInstance = new NodeSDK(generateNodeSDKConfiguration('next-app', version));
  sdkInstance.start();
};

// public async shutdownInstrumentation(): Promise<void> {
//   await this.sdkInstance.shutdown();

//   // メモ: 以下の restart コードは動かない
//   // span/metrics ともに何も出なくなる
//   // そもそも、restart するような使い方が出来なさそう？
//   // see: https://github.com/open-telemetry/opentelemetry-specification/issues/27/
//   // const sdk = new NodeSDK({...});
//   // sdk.start();
//   // await sdk.shutdown().catch(console.error);
//   // const newSdk = new NodeSDK({...});
//   // newSdk.start();
// }
