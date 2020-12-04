class XssOption {

  constructor(config, crowi) {
    const recommendedWhitelist = require('./recommended-whitelist');
    const initializedConfig = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || crowi.xssService.getTagWhiteList() || recommendedWhitelist.tags;
    this.attrWhiteList = initializedConfig.attrWhiteList || crowi.xssService.getAttrWhiteList() || recommendedWhitelist.attrs;

  }

}
module.exports = XssOption;
