import Xss from '~/services/xss';
import XssOption, { XssOptionConfig } from '~/services/xss/xssOption';

export default class XssFilter {

  xssOption: XssOption;

  xss;

  config: XssOptionConfig;

  constructor(config: XssOptionConfig) {
    this.config = config;

    if (config.isEnabledXssPrevention) {
      this.xssOption = new XssOption(config);
      this.xss = new Xss(this.xssOption);
    }
  }

  process(markdown) {
    if (this.config.isEnabledXssPrevention) {
      return this.xss.process(markdown);
    }

    return markdown;
  }

}
