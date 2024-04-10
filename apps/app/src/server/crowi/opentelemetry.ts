import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_INSTANCE_ID, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export class OpenTelemetry {

  name: string;

  instanceId: string;

  version: string;

  sdkInstance: NodeSDK;

  constructor(name: string, instanceId: string, version: string) {
    this.name = name;
    this.instanceId = instanceId;
    this.version = version;
  }

  private generateNodeSDKConfiguration(): Partial<NodeSDKConfiguration> {
    return {
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'next-app',
        // TODO: 環境変数から入れられるようにしたい
        [SEMRESATTRS_SERVICE_INSTANCE_ID]: this.instanceId,
        [SEMRESATTRS_SERVICE_VERSION]: this.version,
      }),
      // TODO: 宛先を環境変数から設定できるようにしたい
      traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4317' }),
      metricReader: new PeriodicExportingMetricReader({
        // TODO: 宛先を環境変数から設定できるようにしたい
        exporter: new OTLPMetricExporter({ url: 'http://otel-collector:4317' }),
        exportIntervalMillis: 10000,
      }),
      instrumentations: [getNodeAutoInstrumentations({
        // この module は大量の trace を生成するため、無効化する
        // see: https://opentelemetry.io/docs/languages/js/libraries/#registration
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      })],
      // 全 trace の半分を出す
      // see: https://opentelemetry.io/docs/languages/js/sampling/
      sampler: new TraceIdRatioBasedSampler(0.5),
    };
  }

  public startInstrumentation(): void {
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
