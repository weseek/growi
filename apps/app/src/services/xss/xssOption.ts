import { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';
import type { RehypeSanitizeOption } from '~/interfaces/rehype';

type tagWhiteList = typeof sanitizeDefaultSchema.tagNames;
type attrWhiteList = typeof sanitizeDefaultSchema.attributes;

export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  xssOption: RehypeSanitizeOption,
  tagWhiteList: tagWhiteList,
  attrWhiteList: attrWhiteList,
}

export default class XssOption {

  isEnabledXssPrevention: boolean;

  tagWhiteList: any[];

  attrWhiteList: any[];

  constructor(config: XssOptionConfig) {
    const recommendedWhitelist = require('~/services/xss/recommended-whitelist');
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || recommendedWhitelist.tags;
    this.attrWhiteList = initializedConfig.attrWhiteList || recommendedWhitelist.attrs;
  }

}
