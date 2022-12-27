import { defaultSchema } from 'rehype-sanitize';

type RehypeSanitizeTags = typeof defaultSchema.tagNames;
type RehypeSanitizeAttributes = typeof defaultSchema.attributes;

export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  tagWhiteList: RehypeSanitizeTags
  attrWhiteList: RehypeSanitizeAttributes,
}

export default class XssOption {

  isEnabledXssPrevention: boolean;

  tagWhiteList: RehypeSanitizeAttributes;

  attrWhiteList: RehypeSanitizeTags;

  constructor(config: XssOptionConfig) {
    const recommendedWhitelist = require('~/services/xss/recommended-whitelist');
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || recommendedWhitelist.tags;
    this.attrWhiteList = initializedConfig.attrWhiteList || recommendedWhitelist.attrs;
  }

}
