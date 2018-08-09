const logger = require('@alias/logger')('growi:InterceptorManager');

/**
 * the manager class of Interceptor
 */
class InterceptorManager {

  constructor() {
    this.interceptorAndOrders = []; /* [
                                          {interceptor: instanceA, order: 200 },
                                          {interceptor: instanceB, order: 100 },
                                          ...
                                       ] */
    this.interceptors = [];
  }

  /**
   * add an Interceptor
   * @param {BasicInterceptor} interceptor
   * @param {number} order
   */
  addInterceptor(interceptor, order) {
    this.addInterceptors([interceptor], order);
  }

  /**
   * add Interceptors
   * @param {BasicInterceptor[]} interceptors
   * @param {number} order
   */
  addInterceptors(interceptors, order) {
    let isDefaultOrder = false;
    if (order == null) {
      order = 100;
      isDefaultOrder = true;
    }

    const interceptorIds = interceptors.map((i) => i.getId());
    logger.info(`'addInterceptors' invoked. adding interceptors '${interceptorIds}' at order=${order}${isDefaultOrder ? '(default)' : ''}`);

    this.interceptorAndOrders = this.interceptorAndOrders.concat(
      interceptors.map(interceptor => {
        return { interceptor, order };
      })
    );

    // sort asc
    this.interceptorAndOrders.sort((a, b) => a.order - b.order);
    // store sorted list
    this.interceptors = this.interceptorAndOrders.map(obj => obj.interceptor);

    const thisInterceptorIds = this.interceptors.map((i) => i.getId());
    logger.info(`interceptors list has initialized: ${thisInterceptorIds}`);
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
