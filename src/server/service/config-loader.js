import Config from '../models/config';

const debug = require('debug')('growi:models:config');

const ENV_VAR_NAME_TO_KEY_MAP = {
  'MONGO_URI': 'app',
  'NODE_ENV': 'app',
  'PORT': 'app',
  'ELASTICSEARCH_URI': 'app',
  'REDIS_URI': 'app',
  'PASSWORD_SEED': 'app',
  'SECRET_TOKEN': 'app',
  'SESSION_NAME': 'app',
  'FILE_UPLOAD': 'app',
  'HACKMD_URI': 'app',
  'HACKMD_URI_FOR_SERVER': 'app',
  'PLANTUML_URI': 'app',
  'BLOCKDIAG_URI': 'app',
  'OAUTH_GOOGLE_CLIENT_ID': 'app',
  'OAUTH_GOOGLE_CLIENT_SECRET': 'app',
  'OAUTH_GITHUB_CLIENT_ID': 'app',
  'OAUTH_GITHUB_CLIENT_SECRET': 'app',
  'OAUTH_TWITTER_CONSUMER_KEY': 'app',
  'OAUTH_TWITTER_CONSUMER_SECRET': 'app',
  'SAML_ENTRY_POINT': 'app',
  'SAML_ISSUER': 'app',
  'SAML_CERT': 'app'
};

class ConfigLoader {

  static async load() {
    await this.integrateEnvVars();

    const config = {};
    await Config.find()
      .sort({ns: 1, key: 1})
      .exec((err, doc) => {

        doc.forEach((el) => {
          if (!config[el.ns]) {
            config[el.ns] = {};
          }
          config[el.ns][el.key] = JSON.parse(el.value);
        });

        debug('Config loaded', config);
      });

    Config.setupConfigFormData('crowi', config);

    return config;
  }

  static async integrateEnvVars() {
    for (const ENV_VAR_NAME of ENV_VAR_NAME_TO_KEY_MAP) {
      try {
        await Config.findOneAndUpdate(
          {ns: 'crowi', key: ENV_VAR_NAME_TO_KEY_MAP[ENV_VAR_NAME]},
          {ns: 'crowi', key: ENV_VAR_NAME, value: JSON.stringify(process.env[ENV_VAR_NAME]), from_env: true},
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
