import type { Attributes } from 'hast-util-sanitize/lib';

import type { RehypeSanitizeOption } from '~/interfaces/rehype';
import { tagNames as recommendedTagNames, attributes as recommendedAttributes } from '~/services/xss/recommended-whitelist';

export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  xssOption: RehypeSanitizeOption,
  tagWhitelist: Array<string>,
  attrWhitelist: Attributes,
}

export default class XssOption {

  isEnabledXssPrevention: boolean;

  tagWhitelist: Array<string>;

  attrWhitelist: Attributes;

  constructor(config: XssOptionConfig) {
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhitelist = initializedConfig.tagWhitelist || recommendedTagNames;
    this.attrWhitelist = initializedConfig.attrWhitelist || recommendedAttributes;
  }

}
