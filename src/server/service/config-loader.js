const debug = require('debug')('growi:models:config');

/**
 * The following env vars ignored because these are used before the configuration setup
 *  or not suitable for storing into the database.
 * - MONGO_URI
 * - NODE_ENV
 * - PORT
 * - REDIS_URI
 * - SESSION_NAME
 * - PASSWORD_SEED
 * - SECRET_TOKEN
 */
const ENV_VAR_NAME_TO_CONFIG_KEY_MAP = {
  /*
   * The commented out item has not yet entered the migration work.
   * So, key names of these are under consideration.
   */
  // 'ELASTICSEARCH_URI':             'elasticsearch:url',
  // 'FILE_UPLOAD':                   'app:fileUploadMethod',
  // 'HACKMD_URI':                    'hackmd:url',
  // 'HACKMD_URI_FOR_SERVER':         'hackmd:urlForServer',
  // 'PLANTUML_URI':                  'plantuml:url',
  // 'BLOCKDIAG_URI':                 'blockdiag:url',
  // 'OAUTH_GOOGLE_CLIENT_ID':        'security:passport-google:clientId',
  // 'OAUTH_GOOGLE_CLIENT_SECRET':    'security:passport-google:clientSecret',
  // 'OAUTH_GOOGLE_CALLBACK_URI':     'security:passport-google:callbackUrl'
  // 'OAUTH_GITHUB_CLIENT_ID':        'security:passport-github:clientId',
  // 'OAUTH_GITHUB_CLIENT_SECRET':    'security:passport-github:clientSecret',
  // 'OAUTH_GITHUB_CALLBACK_URI':     'security:passport-github:callbackUrl'
  // 'OAUTH_TWITTER_CONSUMER_KEY':    'security:passport-twitter:consumerKey',
  // 'OAUTH_TWITTER_CONSUMER_SECRET': 'security:passport-twitter:consumerSecret',
  // 'OAUTH_TWITTER_CALLBACK_URI':    'security:passport-twitter:callbackUrl'
  'SAML_ENTRY_POINT':                 'security:passport-saml:entryPoint',
  'SAML_CALLBACK_URI':                'security:passport-saml:callbackUrl',
  'SAML_ISSUER':                      'security:passport-saml:issuer',
  'SAML_CERT':                        'security:passport-saml:cert',
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

    const mergedConfigFromDB = this.configModel.setupConfigFormData('crowi', configFromDB);

    return {
      fromDB: mergedConfigFromDB,
      fromEnvVars: configFromEnvVars
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
    return config;
  }

  loadFromEnvVars() {
    const config = {};
    config.crowi = {};
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_CONFIG_KEY_MAP)) {
      config.crowi[ENV_VAR_NAME_TO_CONFIG_KEY_MAP[ENV_VAR_NAME]] = process.env[ENV_VAR_NAME];
    }
    return config;
  }
}

module.exports = ConfigLoader;
