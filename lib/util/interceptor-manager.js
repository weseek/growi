const logger = require('@alias/logger')('growi:InterceptorManager');

/**
 * the manager class of Interceptor
 */
class InterceptorManager {

  constructor() {
    this.interceptors = [];
  }

  /**
   * add an Interceptor
   * @param {BasicInterceptor} interceptor
   */
  addInterceptor(interceptor) {
    this.addInterceptors([interceptor]);
  }

  /**
   * add Interceptors
   * @param {BasicInterceptor[]} interceptors
   */
  addInterceptors(interceptors) {
    const interceptorIds = interceptors.map((i) => i.getId());
    logger.debug(`adding interceptors '${interceptorIds}'`);
    this.interceptors = this.interceptors.concat(interceptors);
  }

  /**
   * process Interceptors
   *
   * @param {string} contextName
   * @param {any} args
   */
  process(contextName, ...args) {
    logger.debug(`processing the context '${contextName}'`);

    // filter only contexts matches to specified 'contextName'
    const matchInterceptors = this.interceptors.filter((i) => i.isInterceptWhen(contextName));

    const parallels = matchInterceptors.filter((i) => i.isProcessableParallel());
    const sequentials = matchInterceptors.filter((i) => !i.isProcessableParallel());

    logger.debug(`${parallels.length} parallel interceptors found.`);
    logger.debug(`${sequentials.length} sequencial interceptors found.`);

    return Promise.all(
      // parallel
      parallels.map((interceptor) => {
        return this.doProcess(interceptor, contextName, ...args);
      })
      // sequential
      .concat([
        sequentials.reduce((prevPromise, nextInterceptor) => {
          return prevPromise.then((...results) => this.doProcess(nextInterceptor, contextName, ...results));
        }, Promise.resolve(...args)/* initial Promise */)
      ])
    ).then(() => {
      logger.debug(`end processing the context '${contextName}'`);
      return;
    });
  }

  doProcess(interceptor, contextName, ...args) {
    return interceptor.process(contextName, ...args)
      .then((...results) => {
        logger.debug(`processing '${interceptor.getId()}' in the context '${contextName}'`);
        return Promise.resolve(...results);
      })
      .catch((reason) => {
        logger.debug(`failed when processing '${interceptor.getId()}' in the context '${contextName}'`);
        logger.debug(reason);
        return Promise.resolve(...args);
      });
  }
}

module.exports = InterceptorManager;
