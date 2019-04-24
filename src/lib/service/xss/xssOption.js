class XssOption {

  constructor(config) {
    const recommendedWhitelist = require('./recommended-whiteList');
    const initializedConfig = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || recommendedWhitelist.tags;
    this.attrWhiteList = initializedConfig.attrWhiteList || recommendedWhitelist.attrs;
  }

}
module.exports = XssOption;
