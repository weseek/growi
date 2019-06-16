const logger = require('@alias/logger')('growi:service:CustomizeService'); // eslint-disable-line no-unused-vars

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
      configValue = '{{page}} - {{sitename}}';
    }

    this.customTitleTemplate = configValue;
  }

  generateCustomTitle(page) {
    // replace
    const customTitle = this.customTitleTemplate
      .replace('{{sitename}}', this.appService.getAppTitle())
      .replace('{{page}}', page);

    return this.xssService.process(customTitle);
  }


}

module.exports = CustomizeService;
