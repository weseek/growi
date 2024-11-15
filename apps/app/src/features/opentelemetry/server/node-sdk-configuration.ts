import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';


export const generateNodeSDKConfiguration = (instanceId: string, version: string): Partial<NodeSDKConfiguration> => {
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
