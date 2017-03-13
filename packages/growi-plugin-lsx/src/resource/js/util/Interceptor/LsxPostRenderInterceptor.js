import React from 'react';
import ReactDOM from 'react-dom';

import BasicInterceptor from '../../../../lib/util/BasicInterceptor';

import { Lsx } from '../../components/Lsx';
import { LsxContext } from '../LsxContext';

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
      contextName === 'postRender' ||
      contextName === 'postRenderPreview'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone

    let lsxCacheMap = JSON.parse(sessionStorage.getItem('lsx-cache')) || {};

    // forEach keys of lsxContextMap
    Object.keys(context.lsxContextMap).forEach((renderId) => {
      const elem = document.getElementById(renderId);

      if (elem) {
        // get LsxContext instance from context
        let lsxContext = context.lsxContextMap[renderId];

        // get cache container obj from sessionStorage
        const cacheKey = lsxContext.generateCacheKey();

        // check cache exists
        if (lsxCacheMap[cacheKey]) {
          // render with cache
          this.renderReactDOM(lsxContext, lsxCacheMap[cacheKey], elem);
        }
        else {
          // render without cache
          this.renderReactDOM(lsxContext, false, elem);
        }

      }
    });

    return Promise.resolve();
  }

  renderReactDOM(lsxContext, lsxCache, elem) {
    ReactDOM.render(
      <Lsx crowi={this.crowi} lsxContext={lsxContext} lsxCache={lsxCache} />,
      elem
    );
  }

}
