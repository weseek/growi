import Xss from '~/service/xss';
import XssOption from '~/service/xss/xssOption';

export default class XssFilter {

  constructor(crowi) {
    this.crowi = crowi;

    if (crowi.config.isEnabledXssPrevention) {
      this.xssOption = new XssOption(crowi.config);
      this.xss = new Xss(this.xssOption);
    }
  }

  process(markdown) {
    if (this.crowi.config.isEnabledXssPrevention) {
      return this.xss.process(markdown);
    }

    return markdown;
  }

}
