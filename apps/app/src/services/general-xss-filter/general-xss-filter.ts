import type { IFilterXSSOptions } from 'xss';
import { FilterXSS } from 'xss';

import { uriAutolinkRegexp, emailAutolinkRegexp } from './commonmark-spec';
import type XssOption from './xssOption';


const REPETITIONS_NUM = 50;

export class Xss {

  myxss: FilterXSS;

  constructor(xssOption?: XssOption) {

    const option: IFilterXSSOptions = {
      stripIgnoreTag: true,
      stripIgnoreTagBody: false, // see https://github.com/weseek/growi/pull/505
      css: false,
      whiteList: xssOption != null
        ? xssOption.attrWhitelist as Record<string, string[] | undefined>
        : {},
      escapeHtml: (html) => { return html }, // resolve https://github.com/weseek/growi/issues/221
      onTag: (tag, html) => {
        // pass autolink
        if (tag.match(uriAutolinkRegexp) || tag.match(emailAutolinkRegexp)) {
          return html;
        }
      },
    };

    // create the XSS Filter instance
    this.myxss = new FilterXSS(option);
  }

  process(document: string | undefined): string {
    let count = 0;
    let currDoc = document;
    let prevDoc = document;

    do {
      count += 1;
      // stop running infinitely
      if (count > REPETITIONS_NUM) {
        return '--filtered--';
      }

      prevDoc = currDoc;
      currDoc = this.myxss.process(currDoc ?? '');
    }
    while (currDoc !== prevDoc);

    return currDoc;
  }

}
