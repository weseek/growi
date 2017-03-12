const debug = require('debug')('crowi-plugin:lsx:util:lsx');
const path = require('path');

class Lsx {

  constructor(crowi, app) {
    this.crowi = crowi;
    this.app = app;
  }

  renderHtml(user, currentPath, args) {
    debug(`rendering html for currentPath='${currentPath}', args='${args}'`);

    // TODO try-catch

    // initialize
    let lsxPrefix = args || currentPath;
    let lsxOptions = {};

    // if args is a String like 'key1=value1, key2=value2, ...'
    const splittedArgs = args.split(',');
    if (splittedArgs.length > 1) {
      splittedArgs.forEach((arg) => {
        arg = arg.trim();

        // see https://regex101.com/r/pYHcOM/1
        const match = arg.match(/([^=]+)=?(.+)?/);
        const value = match[2] || true;
        lsxOptions[match[1]] = value;
      });

      // determine prefix
      // 'prefix=foo' pattern or the first argument
      lsxPrefix = lsxOptions.prefix || splittedArgs[0];
    }

    // resolve path
    const pagePath = path.resolve(currentPath, lsxPrefix);
    const queryOptions = {}

    // find pages
    const Page = this.crowi.model('Page');
    return Page.findListByStartWith(pagePath, user, queryOptions)
      .then((pages) => {
        let renderVars = {};
        renderVars.pages = pages;
        renderVars.pager = false
        renderVars.viewConfig = {};

        // app.render widget
        return new Promise((resolve, reject) => {
          this.app.render('widget/page_list', renderVars, (err, html) => {
            if (err) {
              reject(err);
            }
            resolve(html);
          });
        });
      });
  }

}

module.exports = Lsx;
