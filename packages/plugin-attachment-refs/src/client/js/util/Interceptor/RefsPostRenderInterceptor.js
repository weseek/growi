import React from 'react';
import ReactDOM from 'react-dom';

import { BasicInterceptor } from 'growi-commons';

import RefsContext from '../RefsContext';
import GalleryContext from '../GalleryContext';

import AttachmentList from '../../components/AttachmentList';

/**
 * The interceptor for refs
 *
 *  render React DOM
 */
export default class RefsPostRenderInterceptor extends BasicInterceptor {

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

    // forEach keys of tagContextMap
    Object.keys(context.tagContextMap).forEach((domId) => {
      const elem = document.getElementById(domId);

      if (elem) {
        const tagContext = context.tagContextMap[domId];

        // instanciate RefsContext from context
        const refsContext = (tagContext.method === 'gallery')
          ? new GalleryContext(tagContext || {})
          : new RefsContext(tagContext || {});
        refsContext.fromPagePath = context.currentPagePath;

        this.renderReactDom(refsContext, elem);
      }
    });

    return context;
  }

  renderReactDom(refsContext, elem) {
    ReactDOM.render(
      <AttachmentList appContainer={this.appContainer} refsContext={refsContext} />,
      elem,
    );
  }

}
