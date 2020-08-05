// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:service:CustomizeService');

const DevidedPagePath = require('@commons/models/devided-page-path');

/**
 * the service class of CustomizeService
 */
class CustomizeService {

  constructor(configManager, appService, xssService) {
    this.configManager = configManager;
    this.appService = appService;
    this.xssService = xssService;
  }

  /**
   * initialize custom css strings
   */
  initCustomCss() {
    const uglifycss = require('uglifycss');

    const rawCss = this.configManager.getConfig('crowi', 'customize:css') || '';

    // uglify and store
    this.customCss = uglifycss.processString(rawCss);
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
