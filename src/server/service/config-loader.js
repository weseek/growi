const debug = require('debug')('growi:service:ConfigLoader');

const { envUtils } = require('growi-commons');

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
  // ELASTICSEARCH_URI: {
  //   ns:      ,
  //   key:     ,
  //   type:    ,
  //   default:
  // },
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
  MAX_FILE_SIZE: {
    ns:      'crowi',
    key:     'app:maxFileSize',
    type:    TYPES.NUMBER,
    default: Infinity,
  },
  MONGO_GRIDFS_TOTAL_LIMIT: {
    ns:      'crowi',
    key:     'gridfs:totalLimit',
    type:    TYPES.NUMBER,
    default: Infinity,
  },
  FORCE_WIKI_MODE: {
    ns:      'crowi',
    key:     'security:wikiMode',
    type:    TYPES.STRING,
    default: undefined,
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
  GOOGLE_APPLICATION_CREDENTIALS: {
    ns:      'crowi',
    key:     'gcp:config',
    type:    TYPES.STRING,
    default: null,
  },
  GCP_BUCKET: {
    ns:      'crowi',
    key:     'gcp:bucket',
    type:    TYPES.STRING,
    default: null,
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

    // merge defaults
    let mergedConfigFromDB = Object.assign({ crowi: this.configModel.getDefaultCrowiConfigsObject() }, configFromDB);
    mergedConfigFromDB = Object.assign({ markdown: this.configModel.getDefaultMarkdownConfigsObject() }, mergedConfigFromDB);
    mergedConfigFromDB = Object.assign({ notification: this.configModel.getDefaultNotificationConfigsObject() }, mergedConfigFromDB);

    // In getConfig API, only null is used as a value to indicate that a config is not set.
    // So, if a value loaded from the database is emtpy,
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

}

module.exports = ConfigLoader;
