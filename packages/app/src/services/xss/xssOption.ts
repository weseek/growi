export type XssOptionConfig = {
  isEnabledXssPrevention: boolean,
  tagWhiteList: any[],
  attrWhiteList: any[],
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
