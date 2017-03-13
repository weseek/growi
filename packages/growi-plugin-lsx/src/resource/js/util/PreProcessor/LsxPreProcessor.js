import { LsxCache } from '../LsxCache';
import { LsxLoadingContext } from '../LsxLoadingContext';

// TODO change to PreInterceptor
export class LsxPreProcessor {

  constructor(crowi) {
    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  process(markdown) {
    // get current path from window.location
    const currentPagePath = window.location.pathname;
    // TODO retrieve from args for interceptor
    const fromPagePath = currentPagePath;

    return markdown
      // see: https://regex101.com/r/NQq3s9/2
      .replace(/\$lsx\((.*)\)/g, (all, group1) => {
        const tagExpression = all;
        const lsxArgs = group1;

        // get cache container obj from sessionStorage
        let lsxCache = sessionStorage.getItem('lsx-cache');
        if (lsxCache) {
          lsxCache = Object.create(LsxCache, lsxCache);
          const cache = lsxCache.getItem(tagExpression);
          // check cache exists
          if (cache) {
            return cache;
          }
        }

        const renderId = 'lsx-' + this.createRandomStr(8);

        // store contexts
        let contexts = JSON.parse(sessionStorage.getItem('lsx-loading-contexts')) || {};
        contexts[renderId] = new LsxLoadingContext({currentPagePath, tagExpression, fromPagePath, lsxArgs});
        sessionStorage.setItem('lsx-loading-contexts', JSON.stringify(contexts));

        return this.createReactTargetDom(renderId, tagExpression);
      });
  }

  createReactTargetDom(renderId, tagExpression) {
    return `<div id="${renderId}" />`;
  }

  /**
   * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
   * @param {number} length
   * @return random strings
   */
  createRandomStr(length) {
    const bag = "abcdefghijklmnopqrstuvwxyz0123456789";
    let generated = "";
    for (var i = 0; i < length; i++) {
      generated += bag[Math.floor(Math.random() * bag.length)];
    }
    return generated;
  }
}
