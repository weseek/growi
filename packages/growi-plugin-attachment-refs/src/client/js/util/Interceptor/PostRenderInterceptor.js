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
export default class PostRenderInterceptor extends BasicInterceptor {

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

    // forEach keys of tagContextMap
    Object.keys(context.tagContextMap).forEach((domId) => {
      const elem = document.getElementById(domId);

      if (elem) {
        // get TagContext instance from context
        const tagContext = context.tagContextMap[domId] || {};
        // create RefsContext instance
        const refsContext = new RefsContext(tagContext);
        refsContext.fromPagePath = context.currentPagePath;

        this.renderReactDOM(refsContext, elem);
      }
    });

    return Promise.resolve();
  }

  renderReactDOM(refsContext, elem) {
    ReactDOM.render(
      <AttachmentList appContainer={this.appContainer} refsContext={refsContext} />,
      elem,
    );
  }

}
