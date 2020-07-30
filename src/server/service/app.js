const logger = require('@alias/logger')('growi:service:AppService'); // eslint-disable-line no-unused-vars
const { pathUtils } = require('growi-commons');


const ConfigPubsubMessage = require('../models/vo/config-pubsub-message');
const ConfigPubsubMessageHandlable = require('./config-pubsub/handlable');

/**
 * the service class of AppService
 */
class AppService extends ConfigPubsubMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.configPubsub = crowi.configPubsub;
  }

  /**
   * @inheritdoc
   */
  shouldHandleConfigPubsubMessage(configPubsubMessage) {
    const { eventName } = configPubsubMessage;
    if (eventName !== 'systemInstalled') {
      return false;
    }

    const isInstalled = this.crowi.configManager.getConfig('crowi', 'app:installed');

    return !isInstalled;
  }

  /**
   * @inheritdoc
   */
  async handleConfigPubsubMessage(configPubsubMessage) {
    logger.info('Invoke post installation process by pubsub notification');

    const { crowi, configManager, configPubsub } = this;

    // load config and setup
    await configManager.loadConfigs();

    const isInstalled = this.crowi.configManager.getConfig('crowi', 'app:installed');
    if (isInstalled) {
      crowi.setupAfterInstall();

      // remove message handler
      configPubsub.removeMessageHandler(this);
    }
  }

  async publishPostInstallationMessage() {
    const { configPubsub } = this;

    if (configPubsub != null) {
      const configPubsubMessage = new ConfigPubsubMessage('systemInstalled');

      try {
        await configPubsub.publish(configPubsubMessage);
      }
      catch (e) {
        logger.error('Failed to publish post installation message with configPubsub: ', e.message);
      }
    }

    // remove message handler
    configPubsub.removeMessageHandler(this);
  }

  getAppTitle() {
    return this.configManager.getConfig('crowi', 'app:title') || 'GROWI';
  }

  /**
   * get the site url
   *
   * If the config for the site url is not set, this returns a message "[The site URL is not set. Please set it!]".
   *
   * With version 3.2.3 and below, there is no config for the site URL, so the system always uses auto-generated site URL.
   * With version 3.2.4 to 3.3.4, the system uses the auto-generated site URL only if the config is not set.
   * With version 3.3.5 and above, the system use only a value from the config.
   */
  /* eslint-disable no-else-return */
  getSiteUrl() {
    const siteUrl = this.configManager.getConfig('crowi', 'app:siteUrl');
    if (siteUrl != null) {
      return pathUtils.removeTrailingSlash(siteUrl);
    }
    else {
      return '[The site URL is not set. Please set it!]';
    }
  }
  /* eslint-enable no-else-return */

  getTzoffset() {
    return -(this.configManager.getConfig('crowi', 'app:timezone') || 9) * 60;
  }

  getAppConfidential() {
    return this.configManager.getConfig('crowi', 'app:confidential');
  }

  /**
   * Execute only once for installing application
   */
  async initDB(globalLang) {
    const initialConfig = this.configManager.configModel.getConfigsObjectForInstalling();
    initialConfig['app:globalLang'] = globalLang;
    await this.configManager.updateConfigsInTheSameNamespace('crowi', initialConfig, true);
  }

  async isDBInitialized() {
    const appInstalled = await this.configManager.getConfigFromDB('crowi', 'app:installed');
    return appInstalled;
  }

}

module.exports = AppService;
