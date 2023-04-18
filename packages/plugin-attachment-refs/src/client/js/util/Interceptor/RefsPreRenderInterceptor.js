import { findTagAndReplace, BasicInterceptor } from '@growi/core';

import TagCacheManagerFactory from '../TagCacheManagerFactory';

/**
 * The interceptor for refs
 *
 *  replace refs tag to a React target element
 */
export default class RefsPreRenderInterceptor extends BasicInterceptor {

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
  isProcessableParallel() {
    return false;
  }

  /**
   * @inheritdoc
   */
  async process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone
    const parsedHTML = context.parsedHTML;
    this.initializeCache(contextName);

    const tagPattern = /ref|refs|refimg|refsimg|gallery/;
    const result = findTagAndReplace(tagPattern, parsedHTML);

    context.parsedHTML = result.html;
    context.tagContextMap = result.tagContextMap;

    return context;
  }

  /**
   * initialize cache
   *  when contextName is 'preRenderHtml'         -> clear cache
   *  when contextName is 'preRenderPreviewHtml'  -> doesn't clear cache
   *
   * @param {string} contextName
   */
  initializeCache(contextName) {
    if (contextName === 'preRenderHtml') {
      TagCacheManagerFactory.getInstance().clearAllStateCaches();
    }
  }

}
