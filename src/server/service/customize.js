// eslint-disable-next-line no-unused-vars
import loggerFactory from '~/utils/logger';
import DevidedPagePath from '~/models/devided-page-path';

import S2sMessage from '../models/vo/s2s-message';
import S2sMessageHandlable from './s2s-messaging/handlable';

const logger = loggerFactory('growi:service:CustomizeService');


/**
 * the service class of CustomizeService
 */
class CustomizeService extends S2sMessageHandlable {

  constructor(crowi) {
    super();

    this.configManager = crowi.configManager;
    this.s2sMessagingService = crowi.s2sMessagingService;
    this.appService = crowi.appService;
    this.xssService = crowi.xssService;

    this.lastLoadedAt = null;
  }

  /**
   * @inheritdoc
   */
  shouldHandleS2sMessage(s2sMessage) {
    const { eventName, updatedAt } = s2sMessage;
    if (eventName !== 'customizeServiceUpdated' || updatedAt == null) {
      return false;
    }

    return this.lastLoadedAt == null || this.lastLoadedAt < new Date(s2sMessage.updatedAt);
  }

  /**
   * @inheritdoc
   */
  async handleS2sMessage(s2sMessage) {
    const { configManager } = this;

    logger.info('Reset customized value by pubsub notification');
    await configManager.loadConfigs();
    this.initCustomCss();
    this.initCustomTitle();
  }

  async publishUpdatedMessage() {
    const { s2sMessagingService } = this;

    if (s2sMessagingService != null) {
      const s2sMessage = new S2sMessage('customizeServiceUpdated', { updatedAt: new Date() });

      try {
        await s2sMessagingService.publish(s2sMessage);
      }
      catch (e) {
        logger.error('Failed to publish update message with S2sMessagingService: ', e.message);
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
