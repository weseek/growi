import Xss from '~/services/xss';
import XssOption from '~/services/xss/xssOption';

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
