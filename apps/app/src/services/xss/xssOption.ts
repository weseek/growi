import { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';

import type { RehypeSanitizeOption } from '~/interfaces/rehype';

type tagWhitelist = typeof sanitizeDefaultSchema.tagNames;
type attrWhitelist = typeof sanitizeDefaultSchema.attributes;

export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  xssOption: RehypeSanitizeOption,
  tagWhitelist: tagWhitelist,
  attrWhitelist: attrWhitelist,
}

export default class XssOption {

  isEnabledXssPrevention: boolean;

  tagWhitelist: any[];

  attrWhitelist: any[];

  constructor(config: XssOptionConfig) {
    const recommendedWhitelist = require('~/services/xss/recommended-whitelist');
    const initializedConfig: Partial<XssOptionConfig> = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhitelist = initializedConfig.tagWhitelist || recommendedWhitelist.tags;
    this.attrWhitelist = initializedConfig.attrWhitelist || recommendedWhitelist.attrs;
  }

}
