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

  tagWhiteList: RehypeSanitizeTags;

  attrWhiteList: RehypeSanitizeAttributes;

  constructor(config: XssOptionConfig) {
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || defaultSchema.tagNames;
    this.attrWhiteList = initializedConfig.attrWhiteList || defaultSchema.attributes;
  }

}
