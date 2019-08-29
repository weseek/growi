import React from 'react';
import ReactDOM from 'react-dom';

import { BasicInterceptor } from 'growi-commons';

import RefsContext from '../RefsContext';
import AttachmentList from '../../components/AttachmentList';

/**
 * The interceptor for refs
 *
 *  render React DOM
 */
export default class RefsPostRenderInterceptor extends BasicInterceptor {

  constructor(appContainer) {
    super();
    this.appContainer = appContainer;
  }

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
  process(contextName, ...args) {
    const context = Object.assign(args[0]); // clone

    // forEach keys of refsContextMap
    Object.keys(context.refsContextMap).forEach((domId) => {
      const elem = document.getElementById(domId);

      if (elem) {
        // instanciate RefsContext from context
        const refsContext = new RefsContext(context.refsContextMap[domId] || {});
        refsContext.fromPagePath = context.currentPagePath;

        this.renderReactDom(refsContext, elem);
      }
    });

    return Promise.resolve();
  }

  renderReactDom(refsContext, elem) {
    ReactDOM.render(
      <AttachmentList appContainer={this.appContainer} refsContext={refsContext} />,
      elem,
    );
  }

}
