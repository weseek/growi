const logger = require('@alias/logger')('growi:service:XssSerivce'); // eslint-disable-line no-unused-vars
const { tags, attrs } = require('@commons/service/xss/recommended-whitelist');

/**
 * the service class of GlobalNotificationSetting
 */
class XssSerivce {

  constructor(crowi) {
    this.crowi = crowi;
  }

  getTagWhiteList() {
    const isEnabledXssPrevention = this.crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.crowi.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return tags;

        case 3: // custom white list
          return this.crowi.configManager.getConfig('markdown', 'markdown:xss:tagWhiteList');

        default:
          return [];
      }
    }
    else {
      return [];
    }
  }

  getAttrWhiteList() {
    const isEnabledXssPrevention = this.crowi.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.crowi.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return attrs;

        case 3: // custom white list
          return this.crowi.configManager.getConfig('markdown', 'markdown:xss:attrWhiteList');

        default:
          return [];
      }
    }
    else {
      return [];
    }
  }

}

module.exports = XssSerivce;
