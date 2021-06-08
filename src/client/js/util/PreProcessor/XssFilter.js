import Xss from '@commons/service/xss';
import XssOption from '@commons/service/xss/xssOption';

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
      let count = 0;
      let tempValue = markdown;
      let currValue = '';
      while (true) {
        count += 1;
        currValue = this.xss.process(tempValue);
        if(count > 50) return '--filtered--';
        if(currValue == tempValue) break;
        tempValue = currValue;
      }
      return currValue;
    }

    return markdown;
  }

}
