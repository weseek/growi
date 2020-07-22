// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:service:CustomizeService');

const DevidedPagePath = require('@commons/models/devided-page-path');

const ConfigPubsubMessage = require('../models/vo/config-pubsub-message');
const ConfigPubsubMessageHandlable = require('./config-pubsub/handlable');


/**
 * the service class of CustomizeService
 */
class CustomizeService extends ConfigPubsubMessageHandlable {

  constructor(configManager, appService, xssService) {
    super();

    this.configManager = configManager;
    this.appService = appService;
    this.xssService = xssService;

    this.lastLoadedAt = null;
  }

  /**
   * @inheritdoc
   */
  shouldHandleConfigPubsubMessage(configPubsubMessage) {
    const { eventName, updatedAt } = configPubsubMessage;
    if (eventName !== 'customizeServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(configPubsubMessage.updatedAt);
  }

  /**
   * @inheritdoc
   */
  async handleConfigPubsubMessage(configPubsubMessage) {
    const { configManager } = this.appService;

    logger.info('Reset customized value by pubsub notification');
    await configManager.loadConfigs();
    this.initCustomCss();
    this.initCustomTitle();
  }

  async publishUpdatedMessage() {
    const { configPubsub } = this.appService;

    if (configPubsub != null) {
      const configPubsubMessage = new ConfigPubsubMessage('customizeServiceUpdated', { updatedAt: new Date() });

      try {
        await configPubsub.publish(configPubsubMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with configPubsub: ', e.message);
      }
    }
  }

  /**
   * initialize custom css strings
   */
  initCustomCss() {
    const uglifycss = require('uglifycss');

    const rawCss = this.configManager.getConfig('crowi', 'customize:css') || '';

    // uglify and store
    this.customCss = uglifycss.processString(rawCss);

    this.lastLoadedAt = new Date();
  }

  getCustomCss() {
    return this.customCss;
  }

  getCustomScript() {
    return this.configManager.getConfig('crowi', 'customize:script') || '';
  }

  initCustomTitle() {
    let configValue = this.configManager.getConfig('crowi', 'customize:title');

    if (configValue == null || configValue.trim().length === 0) {
      configValue = '{{pagename}} - {{sitename}}';
    }

    this.customTitleTemplate = configValue;

    this.lastLoadedAt = new Date();
  }

  generateCustomTitle(pageOrPath) {
    const path = pageOrPath.path || pageOrPath;
    const dPagePath = new DevidedPagePath(path, true, true);

    const customTitle = this.customTitleTemplate
      .replace('{{sitename}}', this.appService.getAppTitle())
      .replace('{{pagepath}}', path)
      .replace('{{page}}', dPagePath.latter) // for backward compatibility
      .replace('{{pagename}}', dPagePath.latter);

    return this.xssService.process(customTitle);
  }

  generateCustomTitleForFixedPageName(title) {
    // replace
    const customTitle = this.customTitleTemplate
      .replace('{{sitename}}', this.appService.getAppTitle())
      .replace('{{page}}', title)
      .replace('{{pagepath}}', title)
      .replace('{{pagename}}', title);

    return this.xssService.process(customTitle);
  }


}

module.exports = CustomizeService;
