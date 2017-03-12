const stringReplaceAsync = require('string-replace-async');

const BasicInterceptor = require('./BasicInterceptor');
const Lsx = require('./Lsx');

/**
 * The interceptor for lsx Server Side Rendering
 *
 *  replace lsx tag to HTML codes
 *  when contextName is 'beforeRenderPage'
 */
class LsxBeforeRenderPageInterceptor extends BasicInterceptor {

  constructor(crowi, app) {
    super(crowi, app);
    this.lsx = new Lsx(crowi, app);
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return contextName === 'beforeRenderPage';
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const req = args[0];
    const res = args[1];
    const renderVars = args[2];

    let promises = [];
    return stringReplaceAsync(
      renderVars.page.revision.body,
      /\$lsx\((.*)\)/g,   // see: https://regex101.com/r/NQq3s9/2
      (all, group1) => {
        return this.lsx.renderHtml(req.user, req.path, group1);
      }
    ).then((results) => {
      // replace body
      renderVars.page.revision.body = results;
      return Promise.resolve(...args);
    });
  }

}

module.exports = LsxBeforeRenderPageInterceptor;
