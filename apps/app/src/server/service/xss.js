import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:XssSerivce'); // eslint-disable-line no-unused-vars

const Xss = require('~/services/xss');
const { tags, attrs } = require('~/services/xss/recommended-whitelist');

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

  getTagWhitelist() {
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return tags;

        case 3: // custom whitelist
          return this.configManager.getConfig('markdown', 'markdown:xss:tagWhitelist');

        default:
          return [];
      }
    }
    else {
      return [];
    }
  }

  getAttrWhitelist() {
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:xss:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:xss:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case 1: // ignore all: use default option
          return [];

        case 2: // recommended
          return attrs;

        case 3: // custom whitelist
          return this.configManager.getConfig('markdown', 'markdown:xss:attrWhitelist');

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
