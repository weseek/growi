const stringReplaceAsync = require('string-replace-async');

// TODO change to PostProcessor
export class LsxPreProcessor {

  constructor(crowi) {
    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  process(markdown) {
    // get current path from window.location
    let currentPath = window.location.pathname;

    return markdown
      // see: https://regex101.com/r/NQq3s9/2
      .replace(/\$lsx\((.*)\)/g, (all, group1) => {

        const storedItem = sessionStorage.getItem(all);
        if (storedItem) {
          return storedItem;
        }

        const tempHtml = this.createLoadingHtml(all);

        this.replaceLater(tempHtml, currentPath, all, group1);

        return tempHtml;
      });
  }

  replaceLater(tempHtml, currentPath, tagExpression, lsxArgs) {
    // get and replace
    crowi.apiGet('/plugins/lsx', {currentPath: currentPath, args: lsxArgs})
      .then((res) => {
        if (res.ok) {
          return res.html;
        }
        else {
          return Promise.reject({message: res.error});
        }
      })
      .catch((reason) => {
        return this.createErrorHtml(tagExpression, reason);
      })
      // finally replace contents
      .then((html) => {
        // create pattern from escaped html
        const tempHtmlRegexp = new RegExp(this.regexpEscape(tempHtml), 'g');
        // create replaced content
        const orgContent = this.crowiForJquery.getRevisionBodyContent();
        const replacedContent = orgContent.replace(tempHtmlRegexp, html);
        // replace Element.html()
        this.crowiForJquery.replaceRevisionBodyContent(replacedContent);
      });
  }

  createLoadingHtml(tagExpression) {
    return `<i class="fa fa-spinner fa-pulse fa-fw"></i>`
        + `<span class="lsx-blink">${tagExpression}</span>`;
  }

  createErrorHtml(tagExpression, message) {
    return `<i class="fa fa-exclamation-triangle fa-fw"></i>`
        + `${tagExpression} (-> <small>${message}</small>)`;
  }

  regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
}
