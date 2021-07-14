const logger = require('@alias/logger')('growi:service:XssSerivce'); // eslint-disable-line no-unused-vars

const Xss = require('@commons/service/xss');
const { tags, attrs } = require('@commons/service/xss/recommended-whitelist');

/**
 * the service class of XssSerivce
 */
class XssSerivce {

  constructor(configManager) {
    this.configManager = configManager;

    this.xss = new Xss();
  }

  process(value) {
    return this.xss.process(value);
  }

  getTagWhiteList() {
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return tags;

        case 3: // custom white list
          return this.configManager.getConfig('markdown', 'markdown:xss:tagWhiteList');

        default:
          return [];
      }
    }
    else {
      return [];
    }
  }

  getAttrWhiteList() {
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return attrs;

        case 3: // custom white list
          return this.configManager.getConfig('markdown', 'markdown:xss:attrWhiteList');

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
