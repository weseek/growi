import { BasicInterceptor } from 'growi-commons';

import { LsxContext } from '../LsxContext';
import { LsxCacheHelper } from '../LsxCacheHelper';

/**
 * The interceptor for lsx
 *
 *  replace lsx tag to a React target element
 */
export class LsxPreRenderInterceptor extends BasicInterceptor {

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preRenderHtml'
      || contextName === 'preRenderPreviewHtml'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone
    const parsedHTML = context.parsedHTML;
    const currentPagePath = context.currentPagePath;
    this.initializeCache(contextName);

    context.lsxContextMap = {};

    // TODO retrieve from args for interceptor
    const fromPagePath = currentPagePath;

    // see: https://regex101.com/r/NQq3s9/7
    const pattern = /\$lsx(\((.*?)\)(?=\s|<br>|\$lsx))|\$lsx(\((.*)\)(?!\s|<br>|\$lsx))/g;
    context.parsedHTML = parsedHTML.replace(pattern, (all, group1, group2, group3, group4) => {
      const tagExpression = all;
      let lsxArgs = group2 || group4 || '';
      lsxArgs = lsxArgs.trim();

      // create contexts
      const lsxContext = new LsxContext();
      lsxContext.currentPagePath = currentPagePath;
      lsxContext.tagExpression = tagExpression;
      lsxContext.fromPagePath = fromPagePath;
      lsxContext.lsxArgs = lsxArgs;

      const renderId = `lsx-${this.createRandomStr(8)}`;

      context.lsxContextMap[renderId] = lsxContext;

      // return replace strings
      return this.createReactTargetDom(renderId);
    });

    // resolve
    return Promise.resolve(context);
  }

  createReactTargetDom(renderId) {
    return `<div id="${renderId}"></div>`;
  }

  /**
   * initialize cache
   *  when contextName is 'preRenderHtml'         -> clear cache
   *  when contextName is 'preRenderPreviewHtml'  -> doesn't clear cache
   *
   * @param {string} contextName
   *
   * @memberOf LsxPreRenderInterceptor
   */
  initializeCache(contextName) {
    if (contextName === 'preRenderHtml') {
      LsxCacheHelper.clearAllStateCaches();
    }
  }

  /**
   * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
   *
   * @param {number} length
   * @return random strings
   */
  createRandomStr(length) {
    const bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += bag[Math.floor(Math.random() * bag.length)];
    }
    return generated;
  }

}
