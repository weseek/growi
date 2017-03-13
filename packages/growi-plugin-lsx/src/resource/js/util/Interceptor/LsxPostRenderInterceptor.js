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

    let contexts = JSON.parse(sessionStorage.getItem('lsx-loading-contexts')) || {};

    let keysToBeRemoved = [];

    // forEach keys of contexts
    Object.keys(context.lsxContextMap).forEach((renderId) => {
      const elem = document.getElementById(renderId);

      if (elem) {
        // get LsxContext
        const lsxContext = context.lsxContextMap[renderId];
        // render
        this.renderReactDOM(lsxContext, elem);
      }
    });

    return Promise.resolve();
  }

  renderReactDOM(lsxContext, elem) {
    ReactDOM.render(
      <Lsx crowi={this.crowi}
          currentPagePath={lsxContext.currentPagePath}
          tagExpression={lsxContext.tagExpression}
          fromPagePath={lsxContext.fromPagePath}
          lsxArgs={lsxContext.lsxArgs} />,
      elem
    );
  }
}
