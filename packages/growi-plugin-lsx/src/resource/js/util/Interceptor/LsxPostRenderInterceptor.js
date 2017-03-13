import React from 'react';
import ReactDOM from 'react-dom';

import BasicInterceptor from '../../../../lib/util/BasicInterceptor';

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
    const elem = document.getElementById('lsx-1234');

    if (elem) {
      ReactDOM.render(
        <h1>Hello, world!</h1>,
        elem
      );
    }

    return Promise.resolve();
  }

}
