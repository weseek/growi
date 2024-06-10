import { RehypeSanitizeOption } from '~/interfaces/rehype';
import { Xss } from '~/services/xss';
import type { XssOptionConfig } from '~/services/xss/xssOption';
import XssOption from '~/services/xss/xssOption';
import loggerFactory from '~/utils/logger'; // eslint-disable-line no-unused-vars

import { configManager } from './config-manager';

const logger = loggerFactory('growi:service:XssSerivce');


export const xss = (() => {
  const options: XssOptionConfig = {
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option') as RehypeSanitizeOption,
    tagWhitelist: configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    attrWhitelist: configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes'),
  };
  const xssOption = new XssOption(options);
  return new Xss(xssOption);
})();

export const xssForRevisionId = (() => {
  const options: XssOptionConfig = {
    isEnabledXssPrevention: true,
    xssOption: RehypeSanitizeOption.CUSTOM,
    tagWhitelist: [],
    attrWhitelist: {},
  };
  const xssOption = new XssOption(options);
  return new Xss(xssOption);
})();
