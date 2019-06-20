const logger = require('@alias/logger')('growi:service:AppService'); // eslint-disable-line no-unused-vars
const { pathUtils } = require('growi-commons');

/**
 * the service class of GlobalNotificationSetting
 */
class AppService {

  constructor(configManager) {
    this.configManager = configManager;
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

  /**
   * Execute only once for installing application
   */
  async initDB(globalLang) {
    const initialConfig = this.configManager.configModel.getConfigsObjectForInstalling();
    initialConfig['app:globalLang'] = globalLang;
    await this.configManager.updateConfigsInTheSameNamespace('crowi', initialConfig);
  }

  async isDBInitialized() {
    const appInstalled = await this.configManager.getConfigFromDB('crowi', 'app:installed');
    return appInstalled;
  }

}

module.exports = AppService;
