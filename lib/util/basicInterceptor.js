/**
 * Basic Interceptor class
 */
class BasicInterceptor {

  isInterceptWhen(contextName) {
    // implement this
    return false;
  }

  isProcessableParallel() {
    // implement this
    return true;
  }

  process(contextName, ...args) {
    // override this
    return Promise.resolve();
  }

}

module.exports = BasicInterceptor;
