import React from 'react';
import ReactDOM from 'react-dom';

import BasicInterceptor from '../../../../lib/util/BasicInterceptor';

import { Lsx } from '../../components/Lsx';
import { LsxLoadingContext } from '../LsxLoadingContext';

/**
 * The interceptor for lsx
 *
 *  replace lsx tag to HTML codes
 *  when contextName is 'postRenderPreview' and '...' <- TODO
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
    let contexts = JSON.parse(sessionStorage.getItem('lsx-loading-contexts')) || {};

    let keysToBeRemoved = [];

    // forEach keys of contexts
    Object.keys(contexts).forEach((key) => {
      const elem = document.getElementById(key);

      if (elem) {
        const contextObj = contexts[key]
        // remove from context regardless of rendering success or failure
        delete contexts[key];
        // render
        this.renderReactDOM(contextObj, elem);
      }
    });

    // store contexts to sessionStorage
    sessionStorage.setItem('lsx-loading-contexts', JSON.stringify(contexts));

    return Promise.resolve();
  }

  renderReactDOM(contextObj, elem) {
    const context = new LsxLoadingContext(contextObj);
    ReactDOM.render(
      <Lsx crowi={this.crowi}
          currentPagePath={context.currentPagePath}
          tagExpression={context.tagExpression}
          fromPagePath={context.fromPagePath}
          lsxArgs={context.lsxArgs} />,
      elem
    );
  }
}
