import { envUtils } from 'growi-commons';
import { Service } from '@tsed/di';

import loggerFactory from '~/utils/logger';

import ConfigModel, {
  Config, defaultCrowiConfigs, defaultMarkdownConfigs, defaultNotificationConfigs,
} from '../models/config';
import isSecurityEnv from '../../lib/util/isSecurityEnv';

const logger = loggerFactory('growi:service:ConfigLoader');

enum ValueType { NUMBER, STRING, BOOLEAN }

interface ValueParser<T> {
  parse(value: string): T;
}

interface EnvConfig {
  ns: string,
  key: string,
  type: ValueType,
  default?: number | string | boolean | null,
}

type ValueTypeToParserMap<R> = {[key in keyof typeof ValueType]: ValueParser<R> };

const valueTypeToParserMap: ValueTypeToParserMap<number | string | boolean> = {
  NUMBER:  { parse: (v: string) => { return parseInt(v, 10) } },
  STRING:  { parse: (v: string) => { return v } },
  BOOLEAN: { parse: (v: string) => { return envUtils.toBoolean(v) } },
};

/**
 * The following env vars are excluded because these are currently used before the configuration setup.
 * - MONGO_URI
 * - NODE_ENV
 * - PORT
 * - REDIS_URI
 * - SESSION_NAME
 * - PASSWORD_SEED
 * - SECRET_TOKEN
 *
 *  The commented out item has not yet entered the migration work.
 *  So, parameters of these are under consideration.
 */
const ENV_VAR_NAME_TO_CONFIG_INFO: { [type: string]: EnvConfig } = {
  // FILE_UPLOAD: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // HACKMD_URI: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // HACKMD_URI_FOR_SERVER: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // PLANTUML_URI: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // BLOCKDIAG_URI: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CLIENT_ID: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:clientId',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CLIENT_SECRET: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:clientSecret',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GOOGLE_CALLBACK_URI: {
  //   ns:      'crowi',
  //   key:     'security:passport-google:callbackUrl',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CLIENT_ID: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:clientId',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CLIENT_SECRET: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:clientSecret',
  //   type:    ,
  //   default:
  // },
  // OAUTH_GITHUB_CALLBACK_URI: {
  //   ns:      'crowi',
  //   key:     'security:passport-github:callbackUrl',
  //   type:    ,
  //   default:
  // },
  // OAUTH_TWITTER_CONSUMER_KEY: {
  //   ns:      'crowi',
  //   key:     'security:passport-twitter:consumerKey',
  //   type:    ,
  //   default:
  // },
  // OAUTH_TWITTER_CONSUMER_SECRET: {
  //   ns:      'crowi',
  //   key:     'security:passport-twitter:consumerSecret',
  //   type:    ,
  //   default:
  // },
  // OAUTH_TWITTER_CALLBACK_URI: {
  //   ns:      'crowi',
  //   key:     'security:passport-twitter:callbackUrl',
  //   type:    ,
  //   default:
  // },
  DRAWIO_URI: {
    ns:      'crowi',
    key:     'app:drawioUri',
    type:    ValueType.STRING,
    default: null,
  },
  NCHAN_URI: {
    ns:      'crowi',
    key:     'app:nchanUri',
    type:    ValueType.STRING,
    default: null,
  },
  APP_SITE_URL: {
    ns:      'crowi',
    key:     'app:siteUrl',
    type:    ValueType.STRING,
    default: null,
  },
  PUBLISH_OPEN_API: {
    ns:      'crowi',
    key:     'app:publishOpenAPI',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  S2SMSG_PUBSUB_SERVER_TYPE: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:serverType',
    type:    ValueType.STRING,
    default: null,
  },
  S2SMSG_PUBSUB_NCHAN_PUBLISH_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:publishPath',
    type:    ValueType.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_SUBSCRIBE_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:subscribePath',
    type:    ValueType.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_CHANNEL_ID: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:channelId',
    type:    ValueType.STRING,
    default: null,
  },
  MAX_FILE_SIZE: {
    ns:      'crowi',
    key:     'app:maxFileSize',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'app:fileUploadTotalLimit',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_DISABLED: {
    ns:      'crowi',
    key:     'app:fileUploadDisabled',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_USE_INTERNAL_REDIRECT: {
    ns:      'crowi',
    key:     'fileUpload:local:useInternalRedirect',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_INTERNAL_REDIRECT_PATH: {
    ns:      'crowi',
    key:     'fileUpload:local:internalRedirectPath',
    type:    ValueType.STRING,
    default: '/growi-internal/',
  },
  ELASTICSEARCH_URI: {
    ns:      'crowi',
    key:     'app:elasticsearchUri',
    type:    ValueType.STRING,
    default: null,
  },
  ELASTICSEARCH_REQUEST_TIMEOUT: {
    ns:      'crowi',
    key:     'app:elasticsearchRequestTimeout',
    type:    ValueType.NUMBER,
    default: 8000, // msec
  },
  SEARCHBOX_SSL_URL: {
    ns:      'crowi',
    key:     'app:searchboxSslUrl',
    type:    ValueType.STRING,
    default: null,
  },
  MONGO_GRIDFS_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'gridfs:totalLimit',
    type:    ValueType.NUMBER,
    default: null, // set null in default for backward compatibility
    //                cz: Newer system respects FILE_UPLOAD_TOTAL_LIMIT.
    //                    If the default value of MONGO_GRIDFS_TOTAL_LIMIT is Infinity,
    //                      the system can't distinguish between "not specified" and "Infinity is specified".
  },
  FORCE_WIKI_MODE: {
    ns:      'crowi',
    key:     'security:wikiMode',
    type:    ValueType.STRING,
    default: undefined,
  },
  USER_UPPER_LIMIT: {
    ns:      'crowi',
    key:     'security:userUpperLimit',
    type:    ValueType.NUMBER,
    default: Infinity,
  },
  LOCAL_STRATEGY_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-local:isEnabled',
    type:    ValueType.BOOLEAN,
    default: true,
  },
  LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-local:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-saml:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  SAML_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-saml:isEnabled',
    type:    ValueType.BOOLEAN,
    default: null,
  },
  SAML_ENTRY_POINT: {
    ns:      'crowi',
    key:     'security:passport-saml:entryPoint',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_CALLBACK_URI: {
    ns:      'crowi',
    key:     'security:passport-saml:callbackUrl',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ISSUER: {
    ns:      'crowi',
    key:     'security:passport-saml:issuer',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_ID: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapId',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_USERNAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapUsername',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_MAIL: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapMail',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_FIRST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapFirstName',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_LAST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapLastName',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_CERT: {
    ns:      'crowi',
    key:     'security:passport-saml:cert',
    type:    ValueType.STRING,
    default: null,
  },
  SAML_ABLC_RULE: {
    ns:      'crowi',
    key:     'security:passport-saml:ABLCRule',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_API_KEY_JSON_PATH: {
    ns:      'crowi',
    key:     'gcs:apiKeyJsonPath',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_BUCKET: {
    ns:      'crowi',
    key:     'gcs:bucket',
    type:    ValueType.STRING,
    default: null,
  },
  GCS_UPLOAD_NAMESPACE: {
    ns:      'crowi',
    key:     'gcs:uploadNamespace',
    type:    ValueType.STRING,
    default: null,
  },
};

export interface ConfigObject extends Record<string, any> {
  fromDB: any,
  fromEnvVars: any,
}

@Service()
export default class ConfigLoader {

  /**
   * return a config object
   */
  async load(): Promise<ConfigObject> {
    const configFromDB: any = await this.loadFromDB();
    const configFromEnvVars: any = this.loadFromEnvVars();

    // merge defaults per ns
    const mergedConfigFromDB = {
      crowi: Object.assign(defaultCrowiConfigs, configFromDB.crowi),
      markdown: Object.assign(defaultMarkdownConfigs, configFromDB.markdown),
      notification: Object.assign(defaultNotificationConfigs, configFromDB.notification),
    };

    // In getConfig API, only null is used as a value to indicate that a config is not set.
    // So, if a value loaded from the database is empty,
    // it is converted to null because an empty string is used as the same meaning in the config model.
    // By this processing, whether a value is loaded from the database or from the environment variable,
    // only null indicates a config is not set.
    for (const namespace of Object.keys(mergedConfigFromDB)) {
      for (const key of Object.keys(mergedConfigFromDB[namespace])) {
        if (mergedConfigFromDB[namespace][key] === '') {
          mergedConfigFromDB[namespace][key] = null;
        }
      }
    }

    return {
      fromDB: mergedConfigFromDB,
      fromEnvVars: configFromEnvVars,
    };
  }

  async loadFromDB(): Promise<any> {
    const config = {};
    const docs: Config[] = await ConfigModel.find().exec();

    for (const doc of docs) {
      if (!config[doc.ns]) {
        config[doc.ns] = {};
      }
      config[doc.ns][doc.key] = JSON.parse(doc.value);
    }

    logger.debug('ConfigLoader#loadFromDB', config);

    return config;
  }

  loadFromEnvVars(): any {
    const config = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_INFO)) {
      const configInfo = ENV_VAR_NAME_TO_CONFIG_INFO[ENV_VAR_NAME];
      if (config[configInfo.ns] === undefined) {
        config[configInfo.ns] = {};
      }

      if (process.env[ENV_VAR_NAME] === undefined) {
        config[configInfo.ns][configInfo.key] = configInfo.default;
      }
      else {
        const parser: ValueParser<number | string | boolean> = valueTypeToParserMap[configInfo.type];
        config[configInfo.ns][configInfo.key] = parser.parse(process.env[ENV_VAR_NAME] as string);
      }
    }

    logger.debug('ConfigLoader#loadFromEnvVars', config);

    return config;
  }

  /**
   * get config from the environment variables for display admin page
   *
   * **use this only admin home page.**
   */
  static getEnvVarsForDisplay(avoidSecurity = false): any {
    const config = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_INFO)) {
      const configInfo = ENV_VAR_NAME_TO_CONFIG_INFO[ENV_VAR_NAME];
      if (process.env[ENV_VAR_NAME] === undefined) {
        continue;
      }
      if (isSecurityEnv(configInfo.key) && avoidSecurity) {
        continue;
      }
      const parser: ValueParser<number | string | boolean> = valueTypeToParserMap[configInfo.type];
      config[ENV_VAR_NAME] = parser.parse(process.env[ENV_VAR_NAME] as string);
    }

    logger.debug('ConfigLoader#getEnvVarsForDisplay', config);
    return config;
  }

}
