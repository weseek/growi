import loggerFactory from '~/utils/logger';

import { Config } from '../../models/config';

import type {
  ConfigKey,
  RawConfigData,
} from './config-definition';
import {
  CONFIG_DEFINITIONS,
} from './config-definition';


const logger = loggerFactory('growi:service:ConfigLoader');

export class ConfigLoader {

  /**
   * Load configuration from environment variables
   */
  async loadFromEnv(): Promise<RawConfigData['env']> {
    const envConfig: RawConfigData['env'] = {};

    for (const [key, metadata] of Object.entries(CONFIG_DEFINITIONS)) {
      const envValue = process.env[metadata.envVarName];
      if (envValue === undefined) {
        envConfig[key as ConfigKey] = metadata.defaultValue;
      }
      else {
        envConfig[key as ConfigKey] = this.parseEnvValue(envValue, typeof metadata.defaultValue);
      }
    }

    logger.debug('loadFromEnv', envConfig);
    return envConfig;
  }

  /**
   * Load configuration from the database
   */
  async loadFromDB(): Promise<RawConfigData['db']> {
    const dbConfig: RawConfigData['db'] = {};
    const docs = await Config.find().exec();

    for (const doc of docs) {
      dbConfig[doc.key as ConfigKey] = doc.value ? JSON.parse(doc.value) : null;
    }

    logger.debug('loadFromDB', dbConfig);
    return dbConfig;
  }

  private parseEnvValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseInt(value, 10);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'string':
        return value;
      default:
        return value;
    }
  }

}
