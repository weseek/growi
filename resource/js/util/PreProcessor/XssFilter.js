import Xss from '../../../../lib/util/xss';
import xssOption from '../../../../lib/util/xssOption';

export default class XssFilter {

  constructor(crowi) {
    this.xssOption = new xssOption(crowi.config);
    this.xss = new Xss(this.xssOption);
  }

  process(markdown) {
    return this.xss.process(markdown);
  }

}
