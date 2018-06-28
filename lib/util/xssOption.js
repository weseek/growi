class XssOption {

  constructor(config) {
    this.isXssPrevented = config.isXssPrevented;
    this.tagWhiteList = config.tagWhiteList;
    this.attrWhiteList = config.attrWhiteList;
  }

}

module.exports = XssOption;
