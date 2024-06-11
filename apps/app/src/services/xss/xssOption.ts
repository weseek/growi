import type { Attributes } from 'hast-util-sanitize/lib';

import type { RehypeSanitizeOption } from '~/interfaces/rehype';
import { tagNames as recommendedTagNames, attributes as recommendedAttributes } from '~/services/xss/recommended-whitelist';

export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  xssOption: RehypeSanitizeOption,
  customTagWhitelist: Array<string>,
  customAttrWhitelist: Attributes,
}

export default class XssOption {

  isEnabledXssPrevention: boolean;

  tagWhitelist: Array<string>;

  attrWhitelist: Attributes;

  constructor(config: XssOptionConfig) {
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention ?? true;
    this.tagWhitelist = initializedConfig.customTagWhitelist || recommendedTagNames;
    this.attrWhitelist = initializedConfig.customAttrWhitelist || recommendedAttributes;
  }

}
