const debug = require('debug')('growi:service:ConfigLoader');
const { envUtils } = require('growi-commons');
const isSecurityEnv = require('../../lib/util/isSecurityEnv');


const TYPES = {
  NUMBER:  { parse: (v) => { return parseInt(v, 10) } },
  STRING:  { parse: (v) => { return v } },
  BOOLEAN: { parse: (v) => { return envUtils.toBoolean(v) } },
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
    type:    TYPES.STRING,
    default: 'aws',
  },
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
    type:    TYPES.STRING,
    default: null,
  },
  NCHAN_URI: {
    ns:      'crowi',
    key:     'app:nchanUri',
    type:    TYPES.STRING,
    default: null,
  },
  APP_SITE_URL: {
    ns:      'crowi',
    key:     'app:siteUrl',
    type:    TYPES.STRING,
    default: null,
  },
  PUBLISH_OPEN_API: {
    ns:      'crowi',
    key:     'app:publishOpenAPI',
    type:    TYPES.BOOLEAN,
    default: false,
  },
  S2SMSG_PUBSUB_SERVER_TYPE: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:serverType',
    type:    TYPES.STRING,
    default: null,
  },
  S2SMSG_PUBSUB_NCHAN_PUBLISH_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:publishPath',
    type:    TYPES.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_SUBSCRIBE_PATH: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:subscribePath',
    type:    TYPES.STRING,
    default: '/pubsub',
  },
  S2SMSG_PUBSUB_NCHAN_CHANNEL_ID: {
    ns:      'crowi',
    key:     's2sMessagingPubsub:nchan:channelId',
    type:    TYPES.STRING,
    default: null,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimit',
    type:    TYPES.NUMBER,
    default: 5000,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_ADMIN: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForAdmin',
    type:    TYPES.NUMBER,
    default: 100,
  },
  S2CMSG_PUBSUB_CONNECTIONS_LIMIT_FOR_GUEST: {
    ns:      'crowi',
    key:     's2cMessagingPubsub:connectionsLimitForGuest',
    type:    TYPES.NUMBER,
    default: 2000,
  },
  MAX_FILE_SIZE: {
    ns:      'crowi',
    key:     'app:maxFileSize',
    type:    TYPES.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'app:fileUploadTotalLimit',
    type:    TYPES.NUMBER,
    default: Infinity,
  },
  FILE_UPLOAD_DISABLED: {
    ns:      'crowi',
    key:     'app:fileUploadDisabled',
    type:    TYPES.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_USE_INTERNAL_REDIRECT: {
    ns:      'crowi',
    key:     'fileUpload:local:useInternalRedirect',
    type:    TYPES.BOOLEAN,
    default: false,
  },
  FILE_UPLOAD_LOCAL_INTERNAL_REDIRECT_PATH: {
    ns:      'crowi',
    key:     'fileUpload:local:internalRedirectPath',
    type:    TYPES.STRING,
    default: '/growi-internal/',
  },
  ELASTICSEARCH_URI: {
    ns:      'crowi',
    key:     'app:elasticsearchUri',
    type:    TYPES.STRING,
    default: null,
  },
  ELASTICSEARCH_REQUEST_TIMEOUT: {
    ns:      'crowi',
    key:     'app:elasticsearchRequestTimeout',
    type:    TYPES.NUMBER,
    default: 8000, // msec
  },
  SEARCHBOX_SSL_URL: {
    ns:      'crowi',
    key:     'app:searchboxSslUrl',
    type:    TYPES.STRING,
    default: null,
  },
  MONGO_GRIDFS_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'gridfs:totalLimit',
    type:    TYPES.NUMBER,
    default: null, // set null in default for backward compatibility
    //                cz: Newer system respects FILE_UPLOAD_TOTAL_LIMIT.
    //                    If the default value of MONGO_GRIDFS_TOTAL_LIMIT is Infinity,
    //                      the system can't distinguish between "not specified" and "Infinity is specified".
  },
  FORCE_WIKI_MODE: {
    ns:      'crowi',
    key:     'security:wikiMode',
    type:    TYPES.STRING,
    default: undefined,
  },
  USER_UPPER_LIMIT: {
    ns:      'crowi',
    key:     'security:userUpperLimit',
    type:    TYPES.NUMBER,
    default: Infinity,
  },
  LOCAL_STRATEGY_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-local:isEnabled',
    type:    TYPES.BOOLEAN,
    default: true,
  },
  LOCAL_STRATEGY_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-local:useOnlyEnvVarsForSomeOptions',
    type:    TYPES.BOOLEAN,
    default: false,
  },
  SAML_USES_ONLY_ENV_VARS_FOR_SOME_OPTIONS: {
    ns:      'crowi',
    key:     'security:passport-saml:useOnlyEnvVarsForSomeOptions',
    type:    TYPES.BOOLEAN,
    default: false,
  },
  SAML_ENABLED: {
    ns:      'crowi',
    key:     'security:passport-saml:isEnabled',
    type:    TYPES.BOOLEAN,
    default: null,
  },
  SAML_ENTRY_POINT: {
    ns:      'crowi',
    key:     'security:passport-saml:entryPoint',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_CALLBACK_URI: {
    ns:      'crowi',
    key:     'security:passport-saml:callbackUrl',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ISSUER: {
    ns:      'crowi',
    key:     'security:passport-saml:issuer',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_ID: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapId',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_USERNAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapUsername',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_MAIL: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapMail',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_FIRST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapFirstName',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ATTR_MAPPING_LAST_NAME: {
    ns:      'crowi',
    key:     'security:passport-saml:attrMapLastName',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_CERT: {
    ns:      'crowi',
    key:     'security:passport-saml:cert',
    type:    TYPES.STRING,
    default: null,
  },
  SAML_ABLC_RULE: {
    ns:      'crowi',
    key:     'security:passport-saml:ABLCRule',
    type:    TYPES.STRING,
    default: null,
  },
  GCS_API_KEY_JSON_PATH: {
    ns:      'crowi',
    key:     'gcs:apiKeyJsonPath',
    type:    TYPES.STRING,
    default: null,
  },
  GCS_BUCKET: {
    ns:      'crowi',
    key:     'gcs:bucket',
    type:    TYPES.STRING,
    default: null,
  },
  GCS_UPLOAD_NAMESPACE: {
    ns:      'crowi',
    key:     'gcs:uploadNamespace',
    type:    TYPES.STRING,
    default: null,
  },
  IS_GCS_ENV_PRIORITIZED: {
    ns:      'crowi',
    key:     'gcs:isGcsEnvPrioritizes',
    type:    TYPES.BOOLEAN,
    default: false,
  },
};

class ConfigLoader {

  constructor(configModel) {
    this.configModel = configModel;
  }

  /**
   * return a config object
   */
  async load() {
    const configFromDB = await this.loadFromDB();
    const configFromEnvVars = this.loadFromEnvVars();

    // merge defaults per ns
    const mergedConfigFromDB = {
      crowi: Object.assign(this.configModel.getDefaultCrowiConfigsObject(), configFromDB.crowi),
      markdown: Object.assign(this.configModel.getDefaultMarkdownConfigsObject(), configFromDB.markdown),
      notification: Object.assign(this.configModel.getDefaultNotificationConfigsObject(), configFromDB.notification),
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

  async loadFromDB() {
    const config = {};
    const docs = await this.configModel.find().exec();

    for (const doc of docs) {
      if (!config[doc.ns]) {
        config[doc.ns] = {};
      }
      config[doc.ns][doc.key] = JSON.parse(doc.value);
    }

    debug('ConfigLoader#loadFromDB', config);

    return config;
  }

  loadFromEnvVars() {
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
        config[configInfo.ns][configInfo.key] = configInfo.type.parse(process.env[ENV_VAR_NAME]);
      }
    }

    debug('ConfigLoader#loadFromEnvVars', config);

    return config;
  }

  /**
   * get config from the environment variables for display admin page
   *
   * **use this only admin home page.**
   */
  static getEnvVarsForDisplay(avoidSecurity = false) {
    const config = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_INFO)) {
      const configInfo = ENV_VAR_NAME_TO_CONFIG_INFO[ENV_VAR_NAME];
      if (process.env[ENV_VAR_NAME] === undefined) {
        continue;
      }
      if (isSecurityEnv(configInfo.key) && avoidSecurity) {
        continue;
      }
      config[ENV_VAR_NAME] = configInfo.type.parse(process.env[ENV_VAR_NAME]);
    }

    debug('ConfigLoader#getEnvVarsForDisplay', config);
    return config;
  }

}

module.exports = ConfigLoader;
