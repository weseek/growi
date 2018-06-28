class XssOption {

  constructor(config) {
    const recommendedXssWhiteList = require('../util/recommendedXssWhiteList');

    if (config) {
      this.isEnabledXssPrevention = config.isEnabledXssPrevention || true;
      this.tagWhiteList = config.tagWhiteList || recommendedXssWhiteList.tags;
      this.attrWhiteList = config.attrWhiteList || recommendedXssWhiteList.attrs;
    }
    else {
      this.isEnabledXssPrevention = true;
      this.tagWhiteList = recommendedXssWhiteList.tags;
      this.attrWhiteList = recommendedXssWhiteList.attrs;
    }

  }

}

module.exports = XssOption;
