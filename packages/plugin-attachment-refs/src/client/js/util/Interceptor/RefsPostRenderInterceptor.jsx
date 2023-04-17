import { BasicInterceptor } from '@growi/core';
import { createRoot } from 'react-dom/client';

import AttachmentList from '../../components/AttachmentList';
import GalleryContext from '../GalleryContext';
import RefsContext from '../RefsContext';


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
        refsContext.fromPagePath = context.pagePath ?? context.currentPathname;

        this.renderReactDom(refsContext, elem);
      }
    });

    return context;
  }

  renderReactDom(refsContext, elem) {
    const root = createRoot(elem);
    elem.render(<AttachmentList appContainer={this.appContainer} refsContext={refsContext} />);
  }

}
