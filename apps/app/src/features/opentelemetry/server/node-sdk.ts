import { ConfigSource } from '@growi/core/dist/interfaces';
import type { NodeSDK } from '@opentelemetry/sdk-node';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:opentelemetry:server');


let sdkInstance: NodeSDK;

/**
 * Overwrite "OTEL_SDK_DISABLED" env var before sdk.start() is invoked if needed.
 * Since otel library sees it.
 */
function overwriteSdkDisabled(): void {
  const instrumentationEnabled = configManager.getConfig('otel:enabled', ConfigSource.env);

  if (instrumentationEnabled && (
    process.env.OTEL_SDK_DISABLED === 'true'
    || process.env.OTEL_SDK_DISABLED === '1'
  )) {
    logger.warn("OTEL_SDK_DISABLED overwritten with 'false' since GROWI's 'otel:enabled' config is true.");
    process.env.OTEL_SDK_DISABLED = 'false';
    return;
  }

  if (!instrumentationEnabled && (
    process.env.OTEL_SDK_DISABLED === 'false'
    || process.env.OTEL_SDK_DISABLED === '0'
  )) {
    logger.warn("OTEL_SDK_DISABLED is overwritten with 'true' since GROWI's 'otel:enabled' config is false.");
    process.env.OTEL_SDK_DISABLED = 'true';
    return;
  }

}

export const startInstrumentation = async(): Promise<void> => {
  if (sdkInstance != null) {
    logger.warn('OpenTelemetry instrumentation already started');
    return;
  }

  // load configs from env
  await configManager.loadConfigs({ source: ConfigSource.env });

  overwriteSdkDisabled();

  const instrumentationEnabled = configManager.getConfig('otel:enabled', ConfigSource.env);
  if (instrumentationEnabled) {

    logger.info(`GROWI now collects anonymous telemetry.

This data is used to help improve GROWI, but you can opt-out at any time.

For more information, see https://docs.growi.org/en/admin-guide/admin-cookbook/telemetry.html.
`);

    // initialize global logger for development
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      const { initLogger } = await import('./logger');
      initLogger();
    }

    // instanciate NodeSDK
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { generateNodeSDKConfiguration } = await import('./node-sdk-configuration');

    sdkInstance = new NodeSDK(generateNodeSDKConfiguration());
  }
};

export const initServiceInstanceId = async(): Promise<void> => {
  const instrumentationEnabled = configManager.getConfig('otel:enabled', ConfigSource.env);

  if (instrumentationEnabled) {
    const { generateNodeSDKConfiguration } = await import('./node-sdk-configuration');

    const serviceInstanceId = configManager.getConfig('otel:serviceInstanceId')
      ?? configManager.getConfig('app:serviceInstanceId');

    // overwrite resource
    const updatedResource = generateNodeSDKConfiguration(serviceInstanceId).resource;
    (sdkInstance as any)._resource = updatedResource;

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
