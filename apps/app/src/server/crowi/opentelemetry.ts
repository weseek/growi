import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_INSTANCE_ID, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import type Crowi from '.';

export class OpenTelemetry {

  crowi: Crowi;

  name: string;

  instanceId: string;

  version: string;

  sdkInstance: NodeSDK;

  constructor(crowi: Crowi, name: string, instanceId: string, version: string) {
    this.crowi = crowi;
    this.name = name;
    this.instanceId = instanceId;
    this.version = version;
  }

  private generateNodeSDKConfiguration(): Partial<NodeSDKConfiguration> {
    return {
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'next-app',
        [SEMRESATTRS_SERVICE_INSTANCE_ID]: this.crowi.configManager?.getConfig('crowi', 'instrumentation:serviceInstanceId'),
        [SEMRESATTRS_SERVICE_VERSION]: this.version,
      }),
      traceExporter: new OTLPTraceExporter({ url: this.crowi.configManager?.getConfig('crowi', 'instrumentation:otlpTracesEndpoint') }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: this.crowi.configManager?.getConfig('crowi', 'instrumentation:otlpMetricsEndpoint') }),
        exportIntervalMillis: 10000,
      }),
      instrumentations: [getNodeAutoInstrumentations({
        // disable fs instrumentation since this generates very large amount of traces
        // see: https://opentelemetry.io/docs/languages/js/libraries/#registration
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      })],
      // send the half of all traces
      // see: https://opentelemetry.io/docs/languages/js/sampling/
      sampler: new TraceIdRatioBasedSampler(0.5),
    };
  }

  /**
   * Overwrite "OTEL_SDK_ENABLED" env var before sdk.start() is invoked.
   * Since otel library sees it.
   * @see definition ot "OTEL_SDK_ENABLED" in ConfigLoader
   */
  // eslint-enable
  private overwriteSdkEnabled(): void {
    process.env.OTEL_SDK_ENABLED = this.crowi.configManager?.getConfig('crowi', 'instrumentation:enabled');
  }

  public startInstrumentation(): void {
    this.overwriteSdkEnabled();

    this.sdkInstance = new NodeSDK(this.generateNodeSDKConfiguration());
    this.sdkInstance.start();
  }

  public async shutdownInstrumentation(): Promise<void> {
    await this.sdkInstance.shutdown();

    // メモ: 以下の restart コードは動かない
    // span/metrics ともに何も出なくなる
    // そもそも、restart するような使い方が出来なさそう？
    // see: https://github.com/open-telemetry/opentelemetry-specification/issues/27/
    // const sdk = new NodeSDK({...});
    // sdk.start();
    // await sdk.shutdown().catch(console.error);
    // const newSdk = new NodeSDK({...});
    // newSdk.start();
  }

}
