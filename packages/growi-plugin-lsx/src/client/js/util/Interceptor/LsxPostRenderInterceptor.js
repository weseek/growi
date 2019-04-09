import React from 'react';
import ReactDOM from 'react-dom';

import { BasicInterceptor } from 'growi-commons';

import { Lsx } from '../../components/Lsx';
import { LsxCacheHelper } from '../LsxCacheHelper';

/**
 * The interceptor for lsx
 *
 *  render React DOM
 */
export class LsxPostRenderInterceptor extends BasicInterceptor {

  constructor(crowi) {
    super();
    this.crowi = crowi;
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'postRenderHtml' ||
      contextName === 'postRenderPreviewHtml'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone

    // forEach keys of lsxContextMap
    Object.keys(context.lsxContextMap).forEach((renderId) => {
      const elem = document.getElementById(renderId);

      if (elem) {
        // get LsxContext instance from context
        let lsxContext = context.lsxContextMap[renderId];

        // check cache exists
        const cacheKey = LsxCacheHelper.generateCacheKeyFromContext(lsxContext);
        const lsxStateCache = LsxCacheHelper.getStateCache(cacheKey);
        if (lsxStateCache !== undefined) {
          // render with cache
          this.renderReactDOM(lsxContext, lsxStateCache, elem);
        }
        else {
          // render without cache
          this.renderReactDOM(lsxContext, undefined, elem);
        }

      }
    });

    return Promise.resolve();
  }

  renderReactDOM(lsxContext, lsxStateCache, elem) {
    ReactDOM.render(
      <Lsx crowi={this.crowi} lsxContext={lsxContext} lsxStateCache={lsxStateCache} />,
      elem
    );
  }

}
