import React from 'react';

import { BasicInterceptor } from '@growi/core';
import ReactDOM from 'react-dom';


import { Lsx } from '../../components/Lsx';
import { LsxContext } from '../LsxContext';

/**
 * The interceptor for lsx
 *
 *  render React DOM
 */
export class LsxPostRenderInterceptor extends BasicInterceptor {

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'postRenderHtml'
      || contextName === 'postRenderPreviewHtml'
    );
  }

  /**
   * @inheritdoc
   */
  async process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone

    const isPreview = (contextName === 'postRenderPreviewHtml');

    // forEach keys of lsxContextMap
    Object.keys(context.lsxContextMap).forEach((domId) => {
      const elem = document.getElementById(domId);

      if (elem) {
        // instanciate LsxContext from context
        const lsxContext = new LsxContext(context.lsxContextMap[domId] || {});
        lsxContext.fromPagePath = context.pagePath ?? context.currentPathname;

        this.renderReactDOM(lsxContext, elem, isPreview);
      }
    });

    return;
  }

  renderReactDOM(lsxContext, elem, isPreview) {
    ReactDOM.render(
      <Lsx lsxContext={lsxContext} forceToFetchData={!isPreview} />,
      elem,
    );
  }

}
