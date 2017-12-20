import Xss from '../../../../lib/util/xss';

export default class XssFilter {

  constructor(crowi) {
    // TODO read options
    this.xss = new Xss(true);
  }

  process(markdown) {
    return this.xss.process(markdown);
  }

}
