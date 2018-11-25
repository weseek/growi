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
const ENV_VAR_NAME_TO_KEY_MAP = {
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
  // 'OAUTH_GOOGLE_CLIENT_ID':        'google:clientId'     -> 'security:oauth:googleClientId',
  // 'OAUTH_GOOGLE_CLIENT_SECRET':    'google:clientSecret' -> 'security:oauth:googleClientSecret',
  // 'OAUTH_GITHUB_CLIENT_ID':        'security:oauth:githubClientId',
  // 'OAUTH_GITHUB_CLIENT_SECRET':    'security:oauth:githubClientSecret',
  // 'OAUTH_TWITTER_CONSUMER_KEY':    'security:oauth:twitterConsumerKey',
  // 'OAUTH_TWITTER_CONSUMER_SECRET': 'security:oauth:twitterConsumerSecret',
  'SAML_ENTRY_POINT':                 'security:passport-saml:entryPoint',
  'SAML_CALLBACK_URI':                'security:passport-saml:callbackUrl',
  'SAML_ISSUER':                      'security:passport-saml:issuer',
  'SAML_CERT':                        'security:passport-saml:cert',
};

class ConfigLoader {

  constructor(configModel) {
    this.configModel = configModel;
  }

  async load() {
    await this.integrateEnvVars();

    const config = {};
    const docs = await this.configModel.find().exec();

    for (const doc of docs) {
      if (!config[doc.ns]) {
        config[doc.ns] = {};
      }
      config[doc.ns][doc.key] = JSON.parse(doc.value);
    }

    this.configModel.setupConfigFormData('crowi', config);

    return config;
  }

  async integrateEnvVars() {
    for (const ENV_VAR_NAME of Object.keys(ENV_VAR_NAME_TO_KEY_MAP)) {
      try {
        await this.configModel.findOneAndUpdate(
          {ns: 'crowi', key: ENV_VAR_NAME_TO_KEY_MAP[ENV_VAR_NAME]},
          {ns: 'crowi', key: ENV_VAR_NAME_TO_KEY_MAP[ENV_VAR_NAME], value: JSON.stringify(process.env[ENV_VAR_NAME]), from_env: true},
          {upsert: true},
          (err, config) => {
            debug('Config.findAndUpdate', err, config);
          }
        );
      }
      catch (e) {
        debug('Config.findAndUpdate', e);
      }
    }
  }
}

module.exports = ConfigLoader;
