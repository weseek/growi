class XssOption {

  constructor(config) {
    const recommendedXssWhiteList = require('../util/recommendedXssWhiteList');

    if (config) {
      this.isXssPrevented = config.isXssPrevented || true;
      this.tagWhiteList = config.tagWhiteList || recommendedXssWhiteList.tags;
      this.attrWhiteList = config.attrWhiteList || recommendedXssWhiteList.attrs;
    }
    else {
      this.isXssPrevented = true;
      this.tagWhiteList = recommendedXssWhiteList.tags;
      this.attrWhiteList = recommendedXssWhiteList.attrs;
    }

  }

}

module.exports = XssOption;
