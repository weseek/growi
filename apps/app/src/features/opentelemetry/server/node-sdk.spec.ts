import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import { configManager } from '~/server/service/config-manager';

import { detectServiceInstanceId, initInstrumentation } from './node-sdk';
import { getResource } from './node-sdk-resource';
import { getSdkInstance, resetSdkInstance } from './node-sdk.testing';

// Only mock configManager as it's external to what we're testing
vi.mock('~/server/service/config-manager', () => ({
  configManager: {
    getConfig: vi.fn(),
    loadConfigs: vi.fn(),
  },
}));

describe('node-sdk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    resetSdkInstance();

    // Reset configManager mock implementation
    (configManager.getConfig as any).mockImplementation((key: string) => {
      if (key === 'otel:enabled') return true;
      if (key === 'otel:serviceInstanceId') return undefined;
      if (key === 'app:serviceInstanceId') return 'test-instance-id';
      return undefined;
    });
  });

  describe('detectServiceInstanceId', () => {
    it('should update service.instance.id when app:serviceInstanceId is available', async() => {
      // Initialize SDK first
      await initInstrumentation();

      // Get instance for testing
      const sdkInstance = getSdkInstance();
      expect(sdkInstance).toBeDefined();
      expect(sdkInstance).toBeInstanceOf(NodeSDK);

      assert(sdkInstance != null);

      // Verify initial state (service.instance.id should not be set)
      const resource = getResource(sdkInstance);
      expect(resource).toBeInstanceOf(Resource);
      expect(resource.attributes['service.instance.id']).toBeUndefined();

      // Call detectServiceInstanceId
      await detectServiceInstanceId();

      // Verify that resource was updated with app:serviceInstanceId
      const updatedResource = getResource(sdkInstance);
      expect(updatedResource.attributes['service.instance.id']).toBe('test-instance-id');
    });

    it('should update service.instance.id with otel:serviceInstanceId if available', async() => {
      // Mock otel:serviceInstanceId is available
      (configManager.getConfig as any).mockImplementation((key: string) => {
        if (key === 'otel:enabled') return true;
        if (key === 'otel:serviceInstanceId') return 'otel-instance-id';
        if (key === 'app:serviceInstanceId') return 'test-instance-id';
        return undefined;
      });

      // Initialize SDK
      await initInstrumentation();

      // Verify initial state
      const sdkInstance = getSdkInstance();
      assert(sdkInstance != null);

      const resource = getResource(sdkInstance);
      expect(resource.attributes['service.instance.id']).toBeUndefined();

      // Call detectServiceInstanceId
      await detectServiceInstanceId();

      // Verify that otel:serviceInstanceId was used
      const updatedResource = getResource(sdkInstance);
      expect(updatedResource.attributes['service.instance.id']).toBe('otel-instance-id');
    });

    it('should not create SDK instance if instrumentation is disabled', async() => {
      // Mock instrumentation as disabled
      (configManager.getConfig as any).mockImplementation((key: string) => {
        if (key === 'otel:enabled') return false;
        return undefined;
      });

      // Initialize SDK
      await initInstrumentation();

      // Verify that no SDK instance was created
      const sdkInstance = getSdkInstance();
      expect(sdkInstance).toBeUndefined();

      // Call detectServiceInstanceId
      await detectServiceInstanceId();

      // Verify that still no SDK instance exists
      const updatedSdkInstance = getSdkInstance();
      expect(updatedSdkInstance).toBeUndefined();
    });
  });
});
