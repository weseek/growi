import type { IConfigLoader } from '@growi/core/dist/interfaces';

import loggerFactory from '~/utils/logger';

import type { ConfigKey, ConfigValues } from './config-definition';
import { CONFIG_DEFINITIONS } from './config-definition';

const logger = loggerFactory('growi:service:ConfigLoader');

export class ConfigLoader implements IConfigLoader<ConfigKey, ConfigValues> {

  async loadFromEnv(): Promise<Record<ConfigKey, ConfigValues[ConfigKey]>> {
    const envConfig = {} as Record<ConfigKey, ConfigValues[ConfigKey]>;

    for (const [key, metadata] of Object.entries(CONFIG_DEFINITIONS)) {
      const configKey = key as ConfigKey;

      if (metadata.envVarName != null) {
        const envValue = process.env[metadata.envVarName];
        if (envValue !== undefined) {
          envConfig[configKey] = this.parseEnvValue(
            envValue,
            typeof metadata.defaultValue,
          ) as ConfigValues[ConfigKey];
          continue;
        }
      }
      envConfig[configKey] = metadata.defaultValue;
    }

    logger.debug('loadFromEnv', envConfig);
    return envConfig;
  }

  async loadFromDB(): Promise<Record<ConfigKey, ConfigValues[ConfigKey] | null>> {
    const dbConfig = {} as Record<ConfigKey, ConfigValues[ConfigKey] | null>;

    // Initialize with null values
    for (const key of Object.keys(CONFIG_DEFINITIONS)) {
      dbConfig[key as ConfigKey] = null;
    }

    // Dynamic import to avoid loading database modules too early
    const { Config } = await import('../../models/config');
    const docs = await Config.find().exec();

    for (const doc of docs) {
      if (doc.key in CONFIG_DEFINITIONS) {
        dbConfig[doc.key as ConfigKey] = doc.value ? JSON.parse(doc.value) : null;
      }
    }

    logger.debug('loadFromDB', dbConfig);
    return dbConfig;
  }

  private parseEnvValue(value: string, type: string): unknown {
    switch (type) {
      case 'number':
        return parseInt(value, 10);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'string':
        return value;
      case 'object':
        try {
          return JSON.parse(value);
        }
        catch {
          return null;
        }
      default:
        return value;
    }
  }

}
