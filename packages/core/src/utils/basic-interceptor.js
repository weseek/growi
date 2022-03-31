/**
 * Basic Interceptor class
 */
export class BasicInterceptor {

  /**
   * getter for id
   */
  getId() {
    return this.constructor.name;
  }

  /**
   * return whether this interceptor works by specified contextName
   *
   * @param {string} contextName
   * @return {boolean}
   */
  isInterceptWhen(contextName) {
    // implement this
    return false;
  }

  /**
   * return whether this interceptor processes in parallel mode or sequencial mode
   * @return {boolean}
   */
  isProcessableParallel() {
    // implement this
    return true;
  }

  /**
   * process method
   *
   * @param {string} contextName
   * @param {any} args
   * @return {Promise<any>}
   */
  process(contextName, ...args) {
    // override this
    return Promise.resolve(...args);
  }

}
