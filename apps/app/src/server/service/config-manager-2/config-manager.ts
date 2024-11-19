import { parseISO } from 'date-fns/parseISO';

import loggerFactory from '~/utils/logger';

import { Config } from '../../models/config';
import S2sMessage from '../../models/vo/s2s-message';
import type { S2sMessagingService } from '../s2s-messaging/base';
import type { S2sMessageHandlable } from '../s2s-messaging/handlable';

import {
  ConfigKeys,
  CONFIG_DEFINITIONS,
  ENV_ONLY_GROUPS,
} from './config-definition';
import type {
  ConfigKey,
  ConfigValues,
  MergedConfigData,
  RawConfigData,
} from './config-definition';
import { ConfigLoader } from './config-loader';

const logger = loggerFactory('growi:service:ConfigManager');


type ConfigUpdates<K extends ConfigKey> = Partial<{ [P in K]: ConfigValues[P] }>;

export class ConfigManager implements S2sMessageHandlable {

  private configLoader = new ConfigLoader();

  private s2sMessagingService?: S2sMessagingService;

  private rawConfig?: RawConfigData;

  private mergedConfig?: MergedConfigData;

  private lastLoadedAt?: Date;

  private keyToGroupMap: Map<ConfigKey, ConfigKey> = new Map();

  constructor() {
    this.initKeyToGroupMap();
    this.init();
  }

  private initKeyToGroupMap() {
    for (const group of ENV_ONLY_GROUPS) {
      for (const targetKey of group.targetKeys) {
        this.keyToGroupMap.set(targetKey, group.controlKey);
      }
    }
  }

  private async init() {
    await this.loadConfigs();
  }

  private shouldUseEnvOnly(key: ConfigKey): boolean {
    const controlKey = this.keyToGroupMap.get(key);
    if (!controlKey) {
      return false;
    }
    return this.getConfigValue(controlKey) === true;
  }

  async loadConfigs(): Promise<void> {
    this.rawConfig = {
      env: await this.configLoader.loadFromEnv(),
      db: await this.configLoader.loadFromDB(),
    };

    this.mergedConfig = this.mergeConfigs(this.rawConfig);
    this.lastLoadedAt = new Date();
  }

  /**
   * Method to get configuration values with type inference
   */
  getConfig<K extends ConfigKey>(key: K): ConfigValues[K] {
    if (!this.mergedConfig || !this.rawConfig) {
      throw new Error('Config is not loaded');
    }

    // Since key is already constrained by K extends ConfigKey,
    // additional type checks are unnecessary
    if (this.shouldUseEnvOnly(key)) {
      const metadata = CONFIG_DEFINITIONS[key];
      return (this.rawConfig.env[key] ?? metadata.defaultValue) as ConfigValues[K];
    }

    return this.mergedConfig[key].value;
  }

  // Instead, prepare a validation method for public methods that are not type-safe
  validateConfigKey(key: unknown): asserts key is ConfigKey {
    if (!ConfigKeys.includes(key)) {
      throw new Error(`Invalid config key: ${String(key)}`);
    }
  }

  /**
   * Method for receiving any string as a key
   */
  getConfigByKey(key: string): unknown {
    this.validateConfigKey(key);
    return this.getConfig(key);
  }

  /**
   * Get raw config
   */
  getRawConfig(): RawConfigData | undefined {
    return this.rawConfig;
  }

  /**
   * Get merged config
   */
  getMergedConfig(): MergedConfigData | undefined {
    return this.mergedConfig;
  }

  /**
   * Type-safe configuration update
   */
  async updateConfig<K extends ConfigKey>(
      key: K,
      value: ConfigValues[K],
  ): Promise<void> {
    await Config.updateOne(
      { key },
      { value: JSON.stringify(value) },
      { upsert: true },
    );

    await this.loadConfigs();
    await this.publishUpdateMessage();
  }

  /**
   * Bulk update of multiple type-safe configurations
   */
  async updateConfigs<K extends ConfigKey>(
      updates: ConfigUpdates<K>,
  ): Promise<void> {
    const operations = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { value: JSON.stringify(value) },
        upsert: true,
      },
    }));

    await Config.bulkWrite(operations);
    await this.loadConfigs();
    await this.publishUpdateMessage();
  }

  /**
   * Update configuration that is not type-safe (accepts string keys)
   */
  async updateConfigByKey(
      key: string,
      value: unknown,
  ): Promise<void> {
    this.validateConfigKey(key);
    await this.updateConfig(key, value as any);
  }

  /**
   * Bulk update of multiple configurations that are not type-safe (accepts string keys)
   */
  async updateConfigsByKey(
      updates: Record<string, unknown>,
  ): Promise<void> {
    // Validate all keys
    for (const key of Object.keys(updates)) {
      this.validateConfigKey(key);
    }

    await this.updateConfigs(updates as any);
  }

  /**
   * Get value from merged configuration (for condition checks)
   */
  private getConfigValue<K extends ConfigKey>(key: K): ConfigValues[K] {
    if (!this.mergedConfig) {
      throw new Error('Config is not loaded');
    }
    return this.mergedConfig[key].value;
  }

  private mergeConfigs(raw: RawConfigData): MergedConfigData {
    const merged = {} as MergedConfigData;

    for (const key of ConfigKeys.all) {
      const metadata = CONFIG_DEFINITIONS[key];
      const dbValue = raw.db[key];
      const envValue = raw.env[key];

      merged[key] = {
        value: dbValue ?? envValue ?? metadata.defaultValue,
        source: dbValue != null ? 'db' : 'env',
      };
    }

    return merged;
  }

  /**
   * Set S2sMessagingServiceDelegator instance
   * @param s2sMessagingService
   */
  setS2sMessagingService(s2sMessagingService: S2sMessagingService): void {
    this.s2sMessagingService = s2sMessagingService;
  }

  async publishUpdateMessage(): Promise<void> {
    const s2sMessage = new S2sMessage('configUpdated', { updatedAt: new Date() });

    try {
      await this.s2sMessagingService?.publish(s2sMessage);
    }
    catch (e) {
      logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
    }
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage: S2sMessage): boolean {
    const { eventName } = s2sMessage;
    if (eventName !== 'configUpdated') {
      return false;
    }

    return this.lastLoadedAt == null // loaded for the first time
      || !('updatedAt' in s2sMessage) // updatedAt is not included in the message
      || (typeof s2sMessage.updatedAt === 'string' && this.lastLoadedAt < parseISO(s2sMessage.updatedAt));
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(): Promise<void> {
    logger.info('Reload configs by pubsub notification');
    return this.loadConfigs();
  }

}

// Export singleton instance
export const configManager = new ConfigManager();
