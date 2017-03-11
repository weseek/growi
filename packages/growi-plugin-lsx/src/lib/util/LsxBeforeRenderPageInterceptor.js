const BasicInterceptor = require('./BasicInterceptor');

/**
 * The interceptor for lsx Server Side Rendering
 *
 *  replace lsx tag to HTML codes
 *  when contextName is 'beforeRenderPage'
 */
class LsxBeforeRenderPageInterceptor extends BasicInterceptor {

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
    let renderVars = args[0];

    // TODO replace lsx tag

    return Promise.resolve(...args);
  }

}

module.exports = LsxBeforeRenderPageInterceptor;
