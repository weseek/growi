import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import { configManager } from '~/server/service/config-manager';

import { detectServiceInstanceId, initInstrumentation } from './node-sdk';

// Mock configManager
vi.mock('~/server/service/config-manager', () => ({
  configManager: {
    getConfig: vi.fn(),
    loadConfigs: vi.fn(),
  },
}));

// Mock NodeSDK
let mockSdkInstance: any;
vi.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: vi.fn().mockImplementation(() => {
    const instance = {
      _resource: {
        attributes: () => ({
          'service.instance.id': 'default-instance-id',
        }),
      },
      start: vi.fn(),
    };
    mockSdkInstance = instance;
    return instance;
  }),
}));

// Mock node-sdk-configuration
vi.mock('./node-sdk-configuration', () => ({
  generateNodeSDKConfiguration: vi.fn().mockImplementation((serviceInstanceId?: string) => ({
    resource: {
      attributes: () => ({
        'service.instance.id': serviceInstanceId ?? 'default-instance-id',
      }),
    },
  })),
}));

describe('node-sdk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSdkInstance = undefined;

    // Reset configManager mock implementation
    (configManager.getConfig as any).mockImplementation((key: string) => {
      if (key === 'otel:enabled') return true;
      if (key === 'otel:serviceInstanceId') return undefined;
      if (key === 'app:serviceInstanceId') return 'test-instance-id';
      return undefined;
    });
  });

  describe('detectServiceInstanceId', () => {
    it('should update service.instance.id in the resource attributes', async() => {
      // Initialize SDK first
      await initInstrumentation();

      // Get initial resource attributes
      const initialAttributes = mockSdkInstance._resource.attributes();
      expect(initialAttributes['service.instance.id']).toBe('default-instance-id');

      // Call detectServiceInstanceId
      await detectServiceInstanceId();

      // Get updated resource attributes
      const updatedAttributes = mockSdkInstance._resource.attributes();
      expect(updatedAttributes['service.instance.id']).toBe('test-instance-id');
    });

    it('should not update resource if instrumentation is disabled', async() => {
      // Mock instrumentation as disabled
      (configManager.getConfig as any).mockImplementation((key: string) => {
        if (key === 'otel:enabled') return false;
        return undefined;
      });

      // Initialize SDK first
      await initInstrumentation();

      // Call detectServiceInstanceId
      await detectServiceInstanceId();

      // Verify that SDK instance was not created
      expect(mockSdkInstance).toBeUndefined();
    });
  });
});
