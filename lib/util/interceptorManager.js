var debug = require('debug')('crowi:InterceptorManager')

/**
 * the manager class of Interceptor
 */
class InterceptorManager {

  constructor(crowi) {
    this.interceptors = [];
  }

  addInterceptor(interceptor) {
    this.addInterceptors([interceptor]);
  }

  addInterceptors(interceptors) {
    this.interceptors = this.interceptors.concat(interceptors);
  }

  process(contextName, ...args) {
    // filter only context matches
    const matchInterceptors = this.interceptors.filter((i) => i.isInterceptWhen(contextName));

    const parallels = matchInterceptors.filter((i) => i.isProcessableParallel());
    const sequentials = matchInterceptors.filter((i) => !i.isProcessableParallel());

    debug(`processing parallels(${parallels.length})`);
    debug(`processing sequentials(${sequentials.length})`);

    return Promise.all(
      parallels.map((interceptor) => {
        return interceptor.process(contextName, args);
      })
      // .concat[
      //   sequentials.map((interceptor) => (results) => {
      //     interceptor.process(contextName, results)
      //   }).reduce((promise, func) => {
      //     return promise.then((results) => func(results));
      //   }, Promise.resolve(args)).then(() => { return Promise.resolve() })
      // ]
    ).then(() => {
      console.log("Promise.all().then()");
      return;
    });
  }

}

module.exports = (crowi) => {
  return new InterceptorManager(crowi);
}
