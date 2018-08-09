class XssOption {

  constructor(config) {
    const recommendedXssWhiteList = require('./recommendedXssWhiteList');
    const initializedConfig = (config != null) ? config : {};

    this.isEnabledXssPrevention = initializedConfig.isEnabledXssPrevention || true;
    this.tagWhiteList = initializedConfig.tagWhiteList || recommendedXssWhiteList.tags;
    this.attrWhiteList = initializedConfig.attrWhiteList || recommendedXssWhiteList.attrs;
  }

}
module.exports = XssOption;
