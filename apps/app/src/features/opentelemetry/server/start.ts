import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { initLogger } from './logger';


const logger = loggerFactory('growi:opentelemetry');


let sdkInstance: NodeSDK;

function generateNodeSDKConfiguration(instanceId: string, version: string): Partial<NodeSDKConfiguration> {
  return {
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'growi',
      [ATTR_SERVICE_VERSION]: version,
      [SEMRESATTRS_SERVICE_INSTANCE_ID]: instanceId,
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

  if (instrumentationEnabled && (
    process.env.OTEL_SDK_DISABLED === 'true'
    || process.env.OTEL_SDK_DISABLED === '1'
  )) {
    logger.warn("OTEL_SDK_DISABLED will be set 'false' since GROWI's 'otel:enabled' config is true.");
    process.env.OTEL_SDK_DISABLED = 'false';
    return;
  }

  if (!instrumentationEnabled && (
    process.env.OTEL_SDK_DISABLED == null
    || process.env.OTEL_SDK_DISABLED === 'false'
    || process.env.OTEL_SDK_DISABLED === '0'
  )) {
    logger.warn("OTEL_SDK_DISABLED will be set 'true' since GROWI's 'otel:enabled' config is false.");
    process.env.OTEL_SDK_DISABLED = 'true';
    return;
  }

}

export const startInstrumentation = (version: string): void => {
  if (sdkInstance != null) {
    logger.warn('OpenTelemetry instrumentation already started');
    return;
  }

  overwriteSdkDisabled();

  const instrumentationEnabled = configManager.getConfig('crowi', 'otel:enabled');
  if (instrumentationEnabled) {
    initLogger();

    logger.info(`GROWI now collects anonymous telemetry.

This data is used to help improve GROWI, but you can opt-out at any time.

For more information, see https://docs.growi.org/en/admin-guide/telemetry.html.
`);

    const serviceInstanceId = configManager.getConfig('crowi', 'otel:serviceInstanceId');
    sdkInstance = new NodeSDK(generateNodeSDKConfiguration(serviceInstanceId, version));
    sdkInstance.start();
  }
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
