const logger = require('@alias/logger')('growi:service:AppService'); // eslint-disable-line no-unused-vars
const { pathUtils } = require('growi-commons');


const S2sMessage = require('../models/vo/s2s-message');
const S2sMessageHandlable = require('./s2s-messaging/handlable');

/**
 * the service class of AppService
 */
class AppService extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.crowi = crowi;
    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName } = s2sMessage;
    if (eventName !== 'systemInstalled') {
      return false;
    }

    const isInstalled = this.crowi.configManager.getConfig('crowi', 'app:installed');

    return !isInstalled;
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(s2sMessage) {
    logger.info('Invoke post installation process by pubsub notification');

    const isDBInitialized = await this.isDBInitialized(true);
    if (isDBInitialized) {
      this.setupAfterInstall();
    }
  }

  async publishPostInstallationMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('systemInstalled');

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish post installation message with S2sMessagingService: ', e.message);
      }
    }

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

  async isDBInitialized(forceReload) {
    if (forceReload) {
      // load configs
      await this.configManager.loadConfigs();
    }
    return this.configManager.getConfigFromDB('crowi', 'app:installed');
  }

  async setupAfterInstall() {
    this.crowi.pluginService.autoDetectAndLoadPlugins();
    this.crowi.setupRoutesAtLast();

    // remove message handler
    const { s2sMessagingService } = this;
    if (s2sMessagingService != null) {
      this.s2sMessagingService.removeMessageHandler(this);
    }
  }

}

module.exports = AppService;
