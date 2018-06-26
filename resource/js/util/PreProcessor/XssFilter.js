import Xss from '../../../../lib/util/xss';

export default class XssFilter {

  constructor(crowi) {
    this.xss = new Xss(crowi);
  }

  process(markdown) {
    return this.xss.process(markdown);
  }

}
