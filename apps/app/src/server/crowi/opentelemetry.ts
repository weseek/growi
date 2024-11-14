import { diag, type DiagLogger } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_INSTANCE_ID, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import loggerFactory from '~/utils/logger';

import { configManager } from '../service/config-manager';

const logger = loggerFactory('growi:opentelemetry');

const loggerForDiag = loggerFactory('growi:opentelemetry:diag');

class BunyanOTelLogger implements DiagLogger {

  private parseMessage(message: string, args: unknown[]): { logMessage: string, data: object } {
    let logMessage = message;
    let data = {};

    // check whether the message is a JSON string
    try {
      const parsedMessage = JSON.parse(message);
      if (typeof parsedMessage === 'object' && parsedMessage !== null) {
        data = parsedMessage;
        // if parsed successfully, use 'message' property as log message
        logMessage = 'message' in data && typeof data.message === 'string'
          ? data.message
          : message;
      }
    }
    catch (e) {
      // do nothing if the message is not a JSON string
    }

    // merge additional data
    if (args.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const argsData = (args as any).reduce((acc, arg) => {
        if (typeof arg === 'string') {
          try {
            const parsed = JSON.parse(arg);
            return { ...acc, ...parsed };
          }
          catch (e) {
            return { ...acc, additionalInfo: arg };
          }
        }
        return { ...acc, ...arg };
      }, {});
      data = { ...data, ...argsData };
    }

    return { logMessage, data };
  }

  error(message: string, ...args): void {
    const { logMessage, data } = this.parseMessage(message, args);
    loggerForDiag.error(logMessage, data);
  }

  warn(message: string, ...args): void {
    const { logMessage, data } = this.parseMessage(message, args);
    loggerForDiag.error(logMessage, data);
  }

  info(message: string, ...args): void {
    const { logMessage, data } = this.parseMessage(message, args);
    loggerForDiag.error(logMessage, data);
  }

  debug(message: string, ...args): void {
    const { logMessage, data } = this.parseMessage(message, args);
    loggerForDiag.error(logMessage, data);
  }

  verbose(message: string, ...args): void {
    const { logMessage, data } = this.parseMessage(message, args);
    loggerForDiag.error(logMessage, data);
  }

}


// Enable global logger for OpenTelemetry
diag.setLogger(new BunyanOTelLogger());


export class OpenTelemetry {

  name: string;

  version: string;

  sdkInstance: NodeSDK;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }

  private generateNodeSDKConfiguration(): Partial<NodeSDKConfiguration> {
    return {
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: this.name,
        [SEMRESATTRS_SERVICE_INSTANCE_ID]: configManager.getConfig('crowi', 'otel:serviceInstanceId'),
        [SEMRESATTRS_SERVICE_VERSION]: this.version,
      }),
      traceExporter: new OTLPTraceExporter(),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 10000,
      }),
      instrumentations: [getNodeAutoInstrumentations({
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
  private overwriteSdkDisabled(): void {
    const instrumentationEnabled = configManager.getConfig('crowi', 'otel:enabled');
    if (instrumentationEnabled === false) {
      logger.warn("OTEL_SDK_DISABLED will be set 'true' since GROWI's 'otel:enabled' config is false.");
      process.env.OTEL_SDK_DISABLED = 'true';
    }
  }

  public startInstrumentation(): void {
    this.overwriteSdkDisabled();

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
