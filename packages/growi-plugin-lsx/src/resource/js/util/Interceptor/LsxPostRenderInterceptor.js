import React from 'react';
import ReactDOM from 'react-dom';

import BasicInterceptor from '../../../../lib/util/BasicInterceptor';

import { Lsx } from '../../components/Lsx';

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
    return contextName === 'postRenderPreview';
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    let contexts = JSON.parse(sessionStorage.getItem('lsx-loading-contexts')) || {};
    // forEach keys of contexts
    Object.keys(contexts).forEach((renderId) => {
      const elem = document.getElementById(renderId);

      if (elem) {
        const context = contexts[renderId];
        const props = Object.assign(context, {crowi: this.crowi});

        // render
        ReactDOM.render(
          <Lsx crowi={this.crowi}
              tagExpression={context.tagExpression} currentPath={context.currentPath} lsxArgs={context.lsxArgs} />,
          elem
        );
      }
    });

    return Promise.resolve();
  }

}
