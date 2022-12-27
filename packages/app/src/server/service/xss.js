import { RehypeSanitizeOption } from '~/interfaces/rehype';
import loggerFactory from '~/utils/logger'; // eslint-disable-line no-unused-vars

const logger = loggerFactory('growi:service:XssSerivce');

const Xss = require('~/services/xss');

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

  async getTagWhiteList() {
    const { defaultSchema } = await import('rehype-sanitize');
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case RehypeSanitizeOption.RECOMMENDED:
          return defaultSchema.tagNames;

        case RehypeSanitizeOption.CUSTOM:
          return this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames');

        default:
          return [];
      }
    }
    else {
      return [];
    }
  }

  async getAttrWhiteList() {
    const { defaultSchema } = await import('rehype-sanitize');
    const isEnabledXssPrevention = this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention');
    const xssOpiton = this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:option');

    if (isEnabledXssPrevention) {
      switch (xssOpiton) {
        case RehypeSanitizeOption.RECOMMENDED:
          return defaultSchema.attributes;

        case RehypeSanitizeOption.CUSTOM: {
          const rehypeSanitizeAttributesConfig = this.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes');
          const parsedAttrWhiteList = JSON.parse(rehypeSanitizeAttributesConfig);
          return parsedAttrWhiteList;
        }

        default:
          return {};
      }
    }
    else {
      return {};
    }
  }

}

module.exports = XssSerivce;
