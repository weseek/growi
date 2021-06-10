import { envUtils } from 'growi-commons';

import loggerFactory from '~/utils/logger';

import ConfigModel, {
  Config, defaultCrowiConfigs, defaultMarkdownConfigs, defaultNotificationConfigs,
} from '../models/config';

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

type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U;
};

const parserDictionary: EnumDictionary<ValueType, ValueParser<number | string | boolean>> = {
  [ValueType.NUMBER]:  { parse: (v: string) => { return parseInt(v, 10) } },
  [ValueType.STRING]:  { parse: (v: string) => { return v } },
  [ValueType.BOOLEAN]: { parse: (v: string) => { return envUtils.toBoolean(v) } },
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
const ENV_VAR_NAME_TO_CONFIG_INFO = {
  FILE_UPLOAD: {
    ns:      'crowi',
    key:     'app:fileUploadType',
    type:    ValueType.STRING,
    default: 'aws',
  },
  FILE_UPLOAD_USES_ONLY_ENV_VAR_FOR_FILE_UPLOAD_TYPE: {
    ns:      'crowi',
    key:     'app:useOnlyEnvVarForFileUploadType',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  HACKMD_URI: {
    ns:      'crowi',
    key:     'app:hackmdUri',
    type:    ValueType.STRING,
    default: null,
  },
  HACKMD_URI_FOR_SERVER: {
    ns:      'crowi',
    key:     'app:hackmdUriForServer',
    type:    ValueType.STRING,
    default: null,
  },
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
    default: 'https://embed.diagrams.net/',
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
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimit',
    type:    ValueType.NUMBER,
    default: 5000,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_ADMIN: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForAdmin',
    type:    ValueType.NUMBER,
    default: 100,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_GUEST: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForGuest',
    type:    ValueType.NUMBER,
    default: 2000,
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
  SESSION_MAX_AGE: {
    ns:      'crowi',
    key:     'security:sessionMaxAge',
    type:    ValueType.NUMBER,
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
  S3_REFERENCE_FILE_WITH_RELAY_MODE: {
    ns:      'crowi',
    key:     'aws:referenceFileWithRelayMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  S3_LIFETIME_SEC_FOR_TEMPORARY_URL: {
    ns:      'crowi',
    key:     'aws:lifetimeSecForTemporaryUrl',
    type:    ValueType.NUMBER,
    default: 120,
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
  GCS_REFERENCE_FILE_WITH_RELAY_MODE: {
    ns:      'crowi',
    key:     'gcs:referenceFileWithRelayMode',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  GCS_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'gcs:useOnlyEnvVarsForSomeOptions',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  GCS_LIFETIME_SEC_FOR_TEMPORARY_URL: {
    ns:      'crowi',
    key:     'gcs:lifetimeSecForTemporaryUrl',
    type:    ValueType.NUMBER,
    default: 120,
  },
  PROMSTER_ENABLED: {
    ns:      'crowi',
    key:     'promster:isEnabled',
    type:    ValueType.BOOLEAN,
    default: false,
  },
  PROMSTER_PORT: {
    ns:      'crowi',
    key:     'promster:port',
    type:    ValueType.NUMBER,
    default: 7788,
  },
  GROWI_CLOUD_URI: {
    ns:      'crowi',
    key:     'app:growiCloudUri',
    type:    ValueType.STRING,
    default: null,
  },
  GROWI_APP_ID_FOR_GROWI_CLOUD: {
    ns:      'crowi',
    key:     'app:growiAppIdForCloud',
    type:    ValueType.STRING,
    default: null,
  },
  DEFAULT_EMAIL_PUBLISHED: {
    ns:      'crowi',
    key:     'customize:isEmailPublishedForNewUser',
    type:    ValueType.BOOLEAN,
    default: true,
  },
};


/**
 * return whether env belongs to Security settings
 * @param key ex. 'security:passport-saml:isEnabled' is true
 * @returns
 */
const isSecurityEnv = (key) => {
  const array = key.split(':');
  return (array[0] === 'security');
};

export interface ConfigObject extends Record<string, any> {
  fromDB: any,
  fromEnvVars: any,
}

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
        const parser: ValueParser<number | string | boolean> = parserDictionary[configInfo.type];
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
      const parser: ValueParser<number | string | boolean> = parserDictionary[configInfo.type];
      config[ENV_VAR_NAME] = parser.parse(process.env[ENV_VAR_NAME] as string);
    }

    logger.debug('ConfigLoader#getEnvVarsForDisplay', config);
    return config;
  }

}
