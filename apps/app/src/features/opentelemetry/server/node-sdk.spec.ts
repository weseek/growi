import { ConfigSource } from '@growi/core/dist/interfaces';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { configManager } from '~/server/service/config-manager';

import { setupAdditionalResourceAttributes, initInstrumentation } from './node-sdk';
import { getResource } from './node-sdk-resource';

// Only mock configManager as it's external to what we're testing
vi.mock('~/server/service/config-manager', () => ({
  configManager: {
    getConfig: vi.fn(),
    loadConfigs: vi.fn(),
  },
}));

// Mock growi-info service to avoid database dependencies
vi.mock('~/server/service/growi-info', () => ({
  growiInfoService: {
    getGrowiInfo: vi.fn().mockResolvedValue({
      type: 'app',
      deploymentType: 'standalone',
      additionalInfo: {
        attachmentType: 'local',
        installedAt: new Date('2023-01-01T00:00:00.000Z'),
        installedAtByOldestUser: new Date('2023-01-01T00:00:00.000Z'),
      },
    }),
  },
}));

describe('node-sdk', () => {
  beforeEach(async() => {
    vi.clearAllMocks();

    // Reset SDK instance using __testing__ export
    const { __testing__ } = await import('./node-sdk');
    __testing__.reset();

    // Mock loadConfigs to resolve immediately
    vi.mocked(configManager.loadConfigs).mockResolvedValue(undefined);
  });

  describe('setupAdditionalResourceAttributes', () => {
    it('should update service.instance.id when app:serviceInstanceId is available', async() => {
      // Set up mocks for this specific test
      vi.mocked(configManager.getConfig).mockImplementation((key: string, source?: ConfigSource) => {
        // For otel:enabled, always expect ConfigSource.env
        if (key === 'otel:enabled') {
          return source === ConfigSource.env ? true : undefined;
        }
        // For service instance IDs, only respond when no source is specified
        if (key === 'app:serviceInstanceId') return 'test-instance-id';
        return undefined;
      });

      // Initialize SDK first
      await initInstrumentation();

      // Get instance for testing
      const { __testing__ } = await import('./node-sdk');
      const sdkInstance = __testing__.getSdkInstance();
      expect(sdkInstance).toBeDefined();
      expect(sdkInstance).toBeInstanceOf(NodeSDK);

      // Verify initial state (service.instance.id should not be set)
      if (sdkInstance == null) {
        throw new Error('SDK instance should be defined');
      }

      const resource = getResource(sdkInstance);
      expect(resource).toBeDefined();
      expect(resource.attributes['service.instance.id']).toBeUndefined();

      // Call setupAdditionalResourceAttributes
      await setupAdditionalResourceAttributes();

      // Verify that resource was updated with app:serviceInstanceId
      const updatedResource = getResource(sdkInstance);
      expect(updatedResource.attributes['service.instance.id']).toBe('test-instance-id');
    });

    it('should update service.instance.id with otel:serviceInstanceId if available', async() => {
      // Set up mocks for this specific test
      vi.mocked(configManager.getConfig).mockImplementation((key: string, source?: ConfigSource) => {
        // For otel:enabled, always expect ConfigSource.env
        if (key === 'otel:enabled') {
          return source === ConfigSource.env ? true : undefined;
        }

        // For service instance IDs, only respond when no source is specified
        if (source === undefined) {
          if (key === 'otel:serviceInstanceId') return 'otel-instance-id';
          if (key === 'app:serviceInstanceId') return 'test-instance-id';
        }

        return undefined;
      });

      // Initialize SDK
      await initInstrumentation();

      // Get instance and verify initial state
      const { __testing__ } = await import('./node-sdk');
      const sdkInstance = __testing__.getSdkInstance();
      if (sdkInstance == null) {
        throw new Error('SDK instance should be defined');
      }
      const resource = getResource(sdkInstance);
      expect(resource.attributes['service.instance.id']).toBeUndefined();

      // Call setupAdditionalResourceAttributes
      await setupAdditionalResourceAttributes();

      // Verify that otel:serviceInstanceId was used
      const updatedResource = getResource(sdkInstance);
      expect(updatedResource.attributes['service.instance.id']).toBe('otel-instance-id');
    });

    it('should not create SDK instance if instrumentation is disabled', async() => {
      // Mock instrumentation as disabled
      vi.mocked(configManager.getConfig).mockImplementation((key: string, source?: ConfigSource) => {
        // For otel:enabled, always expect ConfigSource.env and return false
        if (key === 'otel:enabled') {
          return source === ConfigSource.env ? false : undefined;
        }
        return undefined;
      });

      // Initialize SDK
      await initInstrumentation();

      // Verify that no SDK instance was created
      const { __testing__ } = await import('./node-sdk');
      const sdkInstance = __testing__.getSdkInstance();
      expect(sdkInstance).toBeUndefined();

      // Call setupAdditionalResourceAttributes
      await setupAdditionalResourceAttributes();

      // Verify that still no SDK instance exists
      const updatedSdkInstance = __testing__.getSdkInstance();
      expect(updatedSdkInstance).toBeUndefined();
    });
  });
});
